package com.example.social_service.comment.service;

import com.example.social_service.comment.dto.CommentAuthorResponse;
import com.example.social_service.comment.dto.CommentResponse;
import com.example.social_service.comment.dto.CreateCommentRequest;
import com.example.social_service.comment.dto.UpdateCommentRequest;
import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.ForbiddenException;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.identity.IdentityUserProfileResponse;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
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
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final IdentityServiceClient identityServiceClient;

    public CommentResponse createComment(UUID userId, String postId, CreateCommentRequest request) {
        Post post = activePost(postId);
        String content = normalizeContent(request.content());
        validateContent(content);

        Instant now = Instant.now();
        Comment comment = Comment.builder()
            .postId(postId)
            .userId(userId)
            .content(content)
            .status(CommentStatus.ACTIVE)
            .createdAt(now)
            .updatedAt(now)
            .build();

        Comment saved = commentRepository.save(comment);
        post.setCommentsCount(post.getCommentsCount() + 1);
        post.setUpdatedAt(now);
        postRepository.save(post);

        return toResponse(saved, fetchAuthors(List.of(userId)));
    }

    public List<CommentResponse> listComments(String postId) {
        activePost(postId);

        List<Comment> comments = commentRepository.findByPostIdAndStatusOrderByCreatedAtAsc(
            postId,
            CommentStatus.ACTIVE
        );
        Map<UUID, IdentityUserProfileResponse> authors = fetchAuthors(
            comments.stream().map(Comment::getUserId).distinct().toList()
        );

        return comments.stream()
            .map(comment -> toResponse(comment, authors))
            .toList();
    }

    public CommentResponse updateComment(UUID userId, String postId, String commentId, UpdateCommentRequest request) {
        activePost(postId);
        Comment comment = activeComment(postId, commentId);
        ensureOwner(userId, comment);

        String content = normalizeContent(request.content());
        validateContent(content);

        comment.setContent(content);
        comment.setUpdatedAt(Instant.now());

        return toResponse(commentRepository.save(comment), fetchAuthors(List.of(userId)));
    }

    public void deleteComment(UUID userId, String postId, String commentId) {
        Post post = activePost(postId);
        Comment comment = activeComment(postId, commentId);
        ensureOwner(userId, comment);

        Instant now = Instant.now();
        comment.setStatus(CommentStatus.DELETED);
        comment.setDeletedAt(now);
        comment.setUpdatedAt(now);
        commentRepository.save(comment);

        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        post.setUpdatedAt(now);
        postRepository.save(post);
    }

    private Post activePost(String postId) {
        return postRepository.findByIdAndStatus(postId, PostStatus.ACTIVE)
            .orElseThrow(() -> new NotFoundException("Post not found"));
    }

    private Comment activeComment(String postId, String commentId) {
        return commentRepository.findByIdAndPostIdAndStatus(commentId, postId, CommentStatus.ACTIVE)
            .orElseThrow(() -> new NotFoundException("Comment not found"));
    }

    private void ensureOwner(UUID userId, Comment comment) {
        if (!comment.getUserId().equals(userId)) {
            throw new ForbiddenException("Only the comment owner can modify this comment");
        }
    }

    private void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Comment content is required");
        }
    }

    private String normalizeContent(String content) {
        return content == null ? "" : content.trim();
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

    private CommentResponse toResponse(Comment comment, Map<UUID, IdentityUserProfileResponse> authors) {
        IdentityUserProfileResponse profile = authors.get(comment.getUserId());
        CommentAuthorResponse author = profile == null
            ? new CommentAuthorResponse(comment.getUserId(), null, "Kirenz User", null)
            : new CommentAuthorResponse(profile.id(), profile.username(), profile.displayName(), profile.avatarUrl());

        return new CommentResponse(
            comment.getId(),
            comment.getPostId(),
            author,
            comment.getContent(),
            comment.getStatus(),
            comment.getCreatedAt(),
            comment.getUpdatedAt()
        );
    }
}
