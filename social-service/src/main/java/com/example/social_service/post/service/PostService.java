package com.example.social_service.post.service;

import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.ForbiddenException;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.identity.IdentityUserProfileResponse;
import com.example.social_service.event.NotificationEvent;
import com.example.social_service.event.NotificationProducer;
import com.example.social_service.post.dto.AuthorResponse;
import com.example.social_service.post.dto.CreatePostRequest;
import com.example.social_service.post.dto.PostImageResponse;
import com.example.social_service.post.dto.PostMediaRequest;
import com.example.social_service.post.dto.PostMediaResponse;
import com.example.social_service.post.dto.PostResponse;
import com.example.social_service.post.dto.SharePostRequest;
import com.example.social_service.post.dto.SharedPostResponse;
import com.example.social_service.post.dto.UpdatePostRequest;
import com.example.social_service.post.model.MediaType;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostMedia;
import com.example.social_service.post.model.PostPrivacy;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.model.ReactionTargetType;
import com.example.social_service.reaction.service.ReactionService;
import com.example.social_service.user.FriendStatusResponse;
import com.example.social_service.user.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final IdentityServiceClient identityServiceClient;
    private final UserServiceClient userServiceClient;
    private final ReactionService reactionService;
    private final NotificationProducer notificationProducer;

    public PostResponse createPost(UUID userId, CreatePostRequest request) {
        List<PostMedia> media = toMedia(request.media());
        String content = normalizeContent(request.content());
        validatePostBody(content, media);
        List<UUID> taggedUserIds = request.taggedUserIds() != null ? request.taggedUserIds() : List.of();

        Instant now = Instant.now();
        Post post = Post.builder()
            .slug("post-" + UUID.randomUUID())
            .userId(userId)
            .content(content)
            .privacy(normalizePrivacy(request.privacy()))
            .media(media)
            .taggedUserIds(taggedUserIds)
            .status(PostStatus.ACTIVE)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Post saved = postRepository.save(post);

        // Publish POST_MENTION events to Kafka
        for (UUID taggedUserId : taggedUserIds) {
            NotificationEvent event = NotificationEvent.builder()
                .type("POST_MENTION")
                .actorId(userId)
                .receiverId(taggedUserId)
                .targetId(saved.getId())
                .message("mentioned you in a post.")
                .createdAt(now)
                .build();
            notificationProducer.sendNotification(event);
        }

        return toResponse(userId, saved, fetchAuthors(authorIdsFor(List.of(saved))), emptyReactionSummary());
    }

    public PostResponse sharePost(UUID userId, String postId, SharePostRequest request) {
        Post originalPost = activePost(postId);
        if (originalPost.getOriginalPostId() != null) {
            originalPost = activePost(originalPost.getOriginalPostId());
        }
        ensureVisible(userId, originalPost);

        Instant now = Instant.now();
        String caption = normalizeContent(request == null ? null : request.caption());
        Post sharedPost = Post.builder()
            .slug("post-" + UUID.randomUUID())
            .userId(userId)
            .content(caption)
            .privacy(PostPrivacy.PUBLIC)
            .originalPostId(originalPost.getId())
            .media(List.of())
            .status(PostStatus.ACTIVE)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Post saved = postRepository.save(sharedPost);
        Map<UUID, IdentityUserProfileResponse> authors = fetchAuthors(List.of(userId, originalPost.getUserId()));
        return toResponse(userId, saved, authors, emptyReactionSummary());
    }

    public List<PostResponse> listFeed(UUID userId) {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE);
        return toResponses(userId, posts);
    }

    public List<PostResponse> listMyPosts(UUID userId) {
        List<Post> posts = postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, PostStatus.ACTIVE);
        return toResponses(userId, posts);
    }

    public List<PostResponse> listUserPosts(UUID viewerId, UUID profileUserId) {
        List<Post> posts = postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(profileUserId, PostStatus.ACTIVE);
        return toResponses(viewerId, posts);
    }

    public List<PostImageResponse> listUserImages(UUID viewerId, UUID profileUserId) {
        return postRepository.findByUserIdAndStatusOrderByCreatedAtDesc(profileUserId, PostStatus.ACTIVE)
            .stream()
            .filter(post -> canView(viewerId, post))
            .flatMap(post -> post.getMedia().stream()
                .filter(media -> media.getType() == MediaType.IMAGE)
                .map(media -> new PostImageResponse(
                    post.getId(),
                    media.getUrl(),
                    media.getPublicId(),
                    post.getCreatedAt()
                )))
            .toList();
    }

    private List<PostResponse> toResponses(UUID userId, List<Post> posts) {
        List<Post> visiblePosts = posts.stream()
            .filter(post -> canView(userId, post))
            .toList();
        Map<UUID, IdentityUserProfileResponse> authors = fetchAuthors(authorIdsFor(visiblePosts));
        Map<String, ReactionSummaryResponse> reactionSummaries = reactionService.getSummaries(
            userId,
            ReactionTargetType.POST,
            visiblePosts.stream().map(Post::getId).toList()
        );

        return visiblePosts.stream()
            .map(post -> toResponse(userId, post, authors, reactionSummaries.getOrDefault(post.getId(), emptyReactionSummary())))
            .toList();
    }

    public PostResponse getPost(UUID userId, String postId) {
        Post post = activePost(postId);
        ensureVisible(userId, post);
        return toResponse(
            userId,
            post,
            fetchAuthors(authorIdsFor(List.of(post))),
            reactionService.getSummary(userId, ReactionTargetType.POST, postId)
        );
    }

    public PostResponse updatePost(UUID userId, String postId, UpdatePostRequest request) {
        Post post = activePost(postId);
        ensureOwner(userId, post);

        List<PostMedia> media = request.media() == null ? post.getMedia() : toMedia(request.media());
        String content = normalizeContent(request.content());
        validatePostBody(content, media);

        post.setContent(content);
        post.setMedia(media);
        post.setPrivacy(request.privacy() == null ? privacyOrDefault(post) : request.privacy());
        post.setUpdatedAt(Instant.now());

        Post saved = postRepository.save(post);
        return toResponse(
            userId,
            saved,
            fetchAuthors(authorIdsFor(List.of(saved))),
            reactionService.getSummary(userId, ReactionTargetType.POST, postId)
        );
    }

    public void deletePost(UUID userId, String postId) {
        Post post = activePost(postId);
        ensureOwner(userId, post);

        Instant now = Instant.now();
        post.setStatus(PostStatus.DELETED);
        post.setDeletedAt(now);
        post.setUpdatedAt(now);
        postRepository.save(post);
    }

    private Post activePost(String postId) {
        return postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new NotFoundException("Post not found"));
    }

    private void ensureOwner(UUID userId, Post post) {
        if (!post.getUserId().equals(userId)) {
            throw new ForbiddenException("Only the post owner can modify this post");
        }
    }

    private void validatePostBody(String content, List<PostMedia> media) {
        if ((content == null || content.isBlank()) && (media == null || media.isEmpty())) {
            throw new BadRequestException("Post content or media is required");
        }
    }

    private List<UUID> authorIdsFor(List<Post> posts) {
        List<UUID> authorIds = posts.stream()
            .map(Post::getUserId)
            .distinct()
            .collect(Collectors.toList());

        posts.stream()
            .map(Post::getOriginalPostId)
            .filter(originalPostId -> originalPostId != null && !originalPostId.isBlank())
            .map(originalPostId -> postRepository.findByIdAndStatus(originalPostId, PostStatus.ACTIVE))
            .flatMap(Optional::stream)
            .map(Post::getUserId)
            .filter(authorId -> !authorIds.contains(authorId))
            .forEach(authorIds::add);

        posts.stream()
            .filter(post -> post.getTaggedUserIds() != null)
            .flatMap(post -> post.getTaggedUserIds().stream())
            .distinct()
            .filter(taggedId -> !authorIds.contains(taggedId))
            .forEach(authorIds::add);

        return authorIds;
    }

    private String normalizeContent(String content) {
        return content == null ? "" : content.trim();
    }

    private PostPrivacy normalizePrivacy(PostPrivacy privacy) {
        return privacy == null ? PostPrivacy.PUBLIC : privacy;
    }

    private String normalizePublicId(String publicId) {
        return publicId == null || publicId.isBlank() ? null : publicId.trim();
    }

    private List<PostMedia> toMedia(List<PostMediaRequest> media) {
        if (media == null) {
            return List.of();
        }

        return media.stream()
            .map(item -> PostMedia.builder()
                .type(item.type())
                .url(item.url().trim())
                .publicId(normalizePublicId(item.publicId()))
                .build())
            .toList();
    }

    private Map<UUID, IdentityUserProfileResponse> fetchAuthors(List<UUID> userIds) {
        if (userIds.isEmpty()) {
            return Map.of();
        }

        try {
            return identityServiceClient.getProfilesByIds(userIds)
                .getData()
                .stream()
                .collect(Collectors.toMap(IdentityUserProfileResponse::id, Function.identity()));
        } catch (RuntimeException ex) {
            return Map.of();
        }
    }

    private PostResponse toResponse(
        UUID viewerId,
        Post post,
        Map<UUID, IdentityUserProfileResponse> authors,
        ReactionSummaryResponse reactionSummary
    ) {
        IdentityUserProfileResponse profile = authors.get(post.getUserId());
        AuthorResponse author = profile == null
            ? new AuthorResponse(post.getUserId(), null, "Kirenz User", null)
            : new AuthorResponse(profile.id(), profile.username(), profile.displayName(), profile.avatarUrl());

        return new PostResponse(
            post.getId(),
            post.getSlug(),
            author,
            post.getContent(),
            privacyOrDefault(post),
            post.getOriginalPostId(),
            toSharedPostResponse(viewerId, post.getOriginalPostId(), authors),
            post.getMedia().stream()
                .map(media -> new PostMediaResponse(media.getType(), media.getUrl(), media.getPublicId()))
                .toList(),
            post.getTaggedUserIds() != null ? post.getTaggedUserIds() : List.of(),
            (post.getTaggedUserIds() != null ? post.getTaggedUserIds() : List.<UUID>of()).stream()
                .map(id -> {
                    IdentityUserProfileResponse p = authors.get(id);
                    return p == null
                        ? new AuthorResponse(id, null, "Kirenz User", null)
                        : new AuthorResponse(p.id(), p.username(), p.displayName(), p.avatarUrl());
                })
                .toList(),
            reactionsCount(post.getReactionsCount()),
            reactionSummary,
            post.getCommentsCount(),
            post.getStatus(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }

    private SharedPostResponse toSharedPostResponse(
        UUID viewerId,
        String originalPostId,
        Map<UUID, IdentityUserProfileResponse> authors
    ) {
        if (originalPostId == null || originalPostId.isBlank()) {
            return null;
        }

        return postRepository.findByIdAndStatus(originalPostId, PostStatus.ACTIVE)
            .map(originalPost -> {
                if (!canView(viewerId, originalPost)) {
                    return unavailableSharedPost(originalPostId);
                }
                IdentityUserProfileResponse profile = authors.get(originalPost.getUserId());
                AuthorResponse author = profile == null
                    ? new AuthorResponse(originalPost.getUserId(), null, "Kirenz User", null)
                    : new AuthorResponse(profile.id(), profile.username(), profile.displayName(), profile.avatarUrl());

                return new SharedPostResponse(
                    originalPost.getId(),
                    author,
                    originalPost.getContent(),
                    privacyOrDefault(originalPost),
                    originalPost.getMedia().stream()
                        .map(media -> new PostMediaResponse(media.getType(), media.getUrl(), media.getPublicId()))
                        .toList(),
                    true,
                    originalPost.getCreatedAt()
                );
            })
            .orElse(unavailableSharedPost(originalPostId));
    }

    private SharedPostResponse unavailableSharedPost(String originalPostId) {
        return new SharedPostResponse(
            originalPostId,
            null,
            null,
            null,
            List.of(),
            false,
            null
        );
    }

    private void ensureVisible(UUID viewerId, Post post) {
        if (!canView(viewerId, post)) {
            throw new NotFoundException("Post not found");
        }
    }

    private boolean canView(UUID viewerId, Post post) {
        if (post.getUserId().equals(viewerId)) {
            return true;
        }

        PostPrivacy privacy = privacyOrDefault(post);
        if (privacy == PostPrivacy.PUBLIC) {
            return true;
        }
        if (privacy == PostPrivacy.ONLY_ME) {
            return false;
        }

        return isFriend(viewerId, post.getUserId());
    }

    private boolean isFriend(UUID viewerId, UUID authorId) {
        if (viewerId.equals(authorId)) {
            return true;
        }

        try {
            FriendStatusResponse status = userServiceClient.getFriendStatus(authorId).getData();
            return status != null && "FRIENDS".equals(status.status());
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private PostPrivacy privacyOrDefault(Post post) {
        return post.getPrivacy() == null ? PostPrivacy.PUBLIC : post.getPrivacy();
    }

    private ReactionSummaryResponse emptyReactionSummary() {
        return new ReactionSummaryResponse(0, null, Map.of());
    }

    private int reactionsCount(Integer reactionsCount) {
        return reactionsCount == null ? 0 : reactionsCount;
    }
}
