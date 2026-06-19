package com.example.social_service.post.service;

import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.ForbiddenException;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.identity.IdentityUserProfileResponse;
import com.example.social_service.post.dto.AuthorResponse;
import com.example.social_service.post.dto.CreatePostRequest;
import com.example.social_service.post.dto.PostMediaRequest;
import com.example.social_service.post.dto.PostMediaResponse;
import com.example.social_service.post.dto.PostResponse;
import com.example.social_service.post.dto.UpdatePostRequest;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostMedia;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.model.ReactionTargetType;
import com.example.social_service.reaction.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final IdentityServiceClient identityServiceClient;
    private final ReactionService reactionService;

    public PostResponse createPost(UUID userId, CreatePostRequest request) {
        List<PostMedia> media = toMedia(request.media());
        String content = normalizeContent(request.content());
        validatePostBody(content, media);

        Instant now = Instant.now();
        Post post = Post.builder()
            .slug("post-" + UUID.randomUUID())
            .userId(userId)
            .content(content)
            .media(media)
            .status(PostStatus.ACTIVE)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Post saved = postRepository.save(post);
        return toResponse(saved, fetchAuthors(List.of(userId)), emptyReactionSummary());
    }

    public List<PostResponse> listFeed(UUID userId) {
        List<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE);
        Map<UUID, IdentityUserProfileResponse> authors = fetchAuthors(
            posts.stream().map(Post::getUserId).distinct().toList()
        );
        Map<String, ReactionSummaryResponse> reactionSummaries = reactionService.getSummaries(
            userId,
            ReactionTargetType.POST,
            posts.stream().map(Post::getId).toList()
        );

        return posts.stream()
            .map(post -> toResponse(post, authors, reactionSummaries.getOrDefault(post.getId(), emptyReactionSummary())))
            .toList();
    }

    public PostResponse getPost(UUID userId, String postId) {
        Post post = activePost(postId);
        return toResponse(
            post,
            fetchAuthors(List.of(post.getUserId())),
            reactionService.getSummary(userId, ReactionTargetType.POST, postId)
        );
    }

    public PostResponse updatePost(UUID userId, String postId, UpdatePostRequest request) {
        Post post = activePost(postId);
        ensureOwner(userId, post);

        List<PostMedia> media = toMedia(request.media());
        String content = normalizeContent(request.content());
        validatePostBody(content, media);

        post.setContent(content);
        post.setMedia(media);
        post.setUpdatedAt(Instant.now());

        Post saved = postRepository.save(post);
        return toResponse(
            saved,
            fetchAuthors(List.of(userId)),
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
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Post content is required");
        }
    }

    private String normalizeContent(String content) {
        return content == null ? "" : content.trim();
    }

    private List<PostMedia> toMedia(List<PostMediaRequest> media) {
        if (media == null) {
            return List.of();
        }

        return media.stream()
            .map(item -> PostMedia.builder()
                .type(item.type())
                .url(item.url().trim())
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
            post.getMedia().stream()
                .map(media -> new PostMediaResponse(media.getType(), media.getUrl()))
                .toList(),
            reactionsCount(post.getReactionsCount()),
            reactionSummary,
            post.getCommentsCount(),
            post.getStatus(),
            post.getCreatedAt(),
            post.getUpdatedAt()
        );
    }

    private ReactionSummaryResponse emptyReactionSummary() {
        return new ReactionSummaryResponse(0, null, Map.of());
    }

    private int reactionsCount(Integer reactionsCount) {
        return reactionsCount == null ? 0 : reactionsCount;
    }
}
