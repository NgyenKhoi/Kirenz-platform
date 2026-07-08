package com.example.social_service.reaction.service;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostPrivacy;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.dto.ReactionRequest;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.model.Reaction;
import com.example.social_service.reaction.model.ReactionTargetType;
import com.example.social_service.reaction.model.ReactionType;
import com.example.social_service.reaction.repository.ReactionRepository;
import com.example.social_service.event.NotificationEvent;
import com.example.social_service.event.NotificationProducer;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.identity.IdentityUserProfileResponse;
import com.example.social_service.reaction.dto.ReactionUserResponse;
import com.example.social_service.user.FriendStatusResponse;
import com.example.social_service.user.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserServiceClient userServiceClient;
    private final IdentityServiceClient identityServiceClient;
    private final NotificationProducer notificationProducer;

    public ReactionSummaryResponse reactToPost(UUID userId, String postId, ReactionRequest request) {
        Post post = visiblePost(userId, postId);
        applyReaction(userId, ReactionTargetType.POST, postId, request.type(), () -> {
            incrementPost(post);
            if (!post.getUserId().equals(userId)) {
                NotificationEvent event = NotificationEvent.builder()
                    .type("POST_LIKE")
                    .actorId(userId)
                    .receiverId(post.getUserId())
                    .targetId(post.getId())
                    .message("send a reaction to your post.")
                    .createdAt(Instant.now())
                    .build();
                notificationProducer.sendNotification(event);
            }
        }, () -> decrementPost(post));
        return getSummary(userId, ReactionTargetType.POST, postId);
    }

    public ReactionSummaryResponse unreactToPost(UUID userId, String postId) {
        Post post = visiblePost(userId, postId);
        removeReaction(userId, ReactionTargetType.POST, postId, () -> decrementPost(post));
        return getSummary(userId, ReactionTargetType.POST, postId);
    }

    public ReactionSummaryResponse reactToComment(UUID userId, String commentId, ReactionRequest request) {
        Comment comment = visibleComment(userId, commentId);
        applyReaction(
            userId,
            ReactionTargetType.COMMENT,
            commentId,
            request.type(),
            () -> incrementComment(comment),
            () -> decrementComment(comment)
        );
        return getSummary(userId, ReactionTargetType.COMMENT, commentId);
    }

    public ReactionSummaryResponse unreactToComment(UUID userId, String commentId) {
        Comment comment = visibleComment(userId, commentId);
        removeReaction(userId, ReactionTargetType.COMMENT, commentId, () -> decrementComment(comment));
        return getSummary(userId, ReactionTargetType.COMMENT, commentId);
    }

    public ReactionSummaryResponse getSummary(UUID userId, ReactionTargetType targetType, String targetId) {
        List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetId(targetType, targetId);
        Map<ReactionType, Long> breakdown = reactions.stream()
            .collect(Collectors.groupingBy(Reaction::getType, () -> new EnumMap<>(ReactionType.class), Collectors.counting()));
        ReactionType currentUserReaction = reactionRepository
            .findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId)
            .map(Reaction::getType)
            .orElse(null);

        return new ReactionSummaryResponse(reactions.size(), currentUserReaction, breakdown);
    }


    public List<ReactionUserResponse> getPostReactionUsers(UUID viewerId, String postId) {
        visiblePost(viewerId, postId);
        return toReactionUsers(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, postId));
    }

    public List<ReactionUserResponse> getCommentReactionUsers(UUID viewerId, String commentId) {
        visibleComment(viewerId, commentId);
        return toReactionUsers(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.COMMENT, commentId));
    }
    public Map<String, ReactionSummaryResponse> getSummaries(
        UUID userId,
        ReactionTargetType targetType,
        List<String> targetIds
    ) {
        if (targetIds.isEmpty()) {
            return Map.of();
        }

        Map<String, List<Reaction>> reactionsByTarget = reactionRepository
            .findByTargetTypeAndTargetIdIn(targetType, targetIds)
            .stream()
            .collect(Collectors.groupingBy(Reaction::getTargetId));

        Map<String, ReactionType> currentByTarget = reactionRepository
            .findByUserIdAndTargetTypeAndTargetIdIn(userId, targetType, targetIds)
            .stream()
            .collect(Collectors.toMap(Reaction::getTargetId, Reaction::getType));

        return targetIds.stream()
            .collect(Collectors.toMap(Function.identity(), targetId -> toSummary(
                reactionsByTarget.getOrDefault(targetId, List.of()),
                currentByTarget.get(targetId)
            )));
    }


    private List<ReactionUserResponse> toReactionUsers(List<Reaction> reactions) {
        if (reactions.isEmpty()) {
            return List.of();
        }

        List<UUID> userIds = reactions.stream()
            .map(Reaction::getUserId)
            .distinct()
            .toList();

        Map<UUID, IdentityUserProfileResponse> profiles = identityServiceClient.getProfilesByIds(userIds)
            .getData()
            .stream()
            .collect(Collectors.toMap(IdentityUserProfileResponse::id, Function.identity()));

        return reactions.stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .map(reaction -> {
                IdentityUserProfileResponse profile = profiles.get(reaction.getUserId());
                return new ReactionUserResponse(
                    reaction.getUserId(),
                    profile == null ? null : profile.username(),
                    profile == null ? "Kirenz User" : profile.displayName(),
                    profile == null ? null : profile.avatarUrl(),
                    reaction.getType(),
                    reaction.getCreatedAt()
                );
            })
            .toList();
    }
    private void applyReaction(
        UUID userId,
        ReactionTargetType targetType,
        String targetId,
        ReactionType type,
        Runnable onCreated,
        Runnable onDeleted
    ) {
        Instant now = Instant.now();
        reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId)
            .ifPresentOrElse(existing -> {
                if (existing.getType() == type) {
                    reactionRepository.delete(existing);
                    onDeleted.run();
                    return;
                }
                existing.setType(type);
                existing.setUpdatedAt(now);
                reactionRepository.save(existing);
            }, () -> {
                reactionRepository.save(Reaction.builder()
                    .userId(userId)
                    .targetType(targetType)
                    .targetId(targetId)
                    .type(type)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
                onCreated.run();
            });
    }

    private void removeReaction(UUID userId, ReactionTargetType targetType, String targetId, Runnable onDeleted) {
        reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId)
            .ifPresent(reaction -> {
                reactionRepository.delete(reaction);
                onDeleted.run();
            });
    }

    private Post activePost(String postId) {
        return postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new NotFoundException("Post not found"));
    }

    private Post visiblePost(UUID viewerId, String postId) {
        Post post = activePost(postId);
        if (!canView(viewerId, post)) {
            throw new NotFoundException("Post not found");
        }
        return post;
    }

    private Comment visibleComment(UUID viewerId, String commentId) {
        Comment comment = commentRepository.findByIdAndStatus(commentId, CommentStatus.ACTIVE)
            .orElseThrow(() -> new NotFoundException("Comment not found"));
        visiblePost(viewerId, comment.getPostId());
        return comment;
    }

    private boolean canView(UUID viewerId, Post post) {
        if (post.getUserId().equals(viewerId)) {
            return true;
        }
        PostPrivacy privacy = post.getPrivacy() == null ? PostPrivacy.PUBLIC : post.getPrivacy();
        if (privacy == PostPrivacy.PUBLIC) {
            return true;
        }
        if (privacy == PostPrivacy.ONLY_ME) {
            return false;
        }
        try {
            FriendStatusResponse status = userServiceClient.getFriendStatus(post.getUserId()).getData();
            return status != null && "FRIENDS".equals(status.status());
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private void incrementPost(Post post) {
        post.setReactionsCount(reactionsCount(post.getReactionsCount()) + 1);
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
    }

    private void decrementPost(Post post) {
        post.setReactionsCount(Math.max(0, reactionsCount(post.getReactionsCount()) - 1));
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
    }

    private void incrementComment(Comment comment) {
        comment.setReactionsCount(reactionsCount(comment.getReactionsCount()) + 1);
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);
    }

    private void decrementComment(Comment comment) {
        comment.setReactionsCount(Math.max(0, reactionsCount(comment.getReactionsCount()) - 1));
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);
    }

    private int reactionsCount(Integer reactionsCount) {
        return reactionsCount == null ? 0 : reactionsCount;
    }

    private ReactionSummaryResponse toSummary(List<Reaction> reactions, ReactionType currentUserReaction) {
        Map<ReactionType, Long> breakdown = reactions.stream()
            .collect(Collectors.groupingBy(Reaction::getType, () -> new EnumMap<>(ReactionType.class), Collectors.counting()));
        return new ReactionSummaryResponse(reactions.size(), currentUserReaction, breakdown);
    }
}


