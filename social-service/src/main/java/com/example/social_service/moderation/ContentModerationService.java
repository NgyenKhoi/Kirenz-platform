package com.example.social_service.moderation;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.moderation.dto.ModerationCommandResponse;
import com.example.social_service.moderation.dto.ModerationContentResponse;
import com.example.social_service.moderation.dto.ModerationMediaResponse;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentModerationService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final Clock clock;

    public ModerationContentResponse getDetail(ModerationTargetType targetType, String targetId) {
        String id = normalizeId(targetId);
        return switch (targetType) {
            case POST -> toResponse(loadPost(id));
            case COMMENT -> toResponse(loadComment(id));
        };
    }

    public ModerationCommandResponse hide(ModerationTargetType targetType, String targetId) {
        String id = normalizeId(targetId);
        return switch (targetType) {
            case POST -> hidePost(loadPost(id));
            case COMMENT -> hideComment(loadComment(id));
        };
    }

    public ModerationCommandResponse remove(ModerationTargetType targetType, String targetId) {
        String id = normalizeId(targetId);
        return switch (targetType) {
            case POST -> removePost(loadPost(id));
            case COMMENT -> removeComment(loadComment(id));
        };
    }

    private ModerationCommandResponse hidePost(Post post) {
        if (post.getStatus() != PostStatus.ACTIVE) {
            throw new BadRequestException("Only active posts can be hidden");
        }
        String previous = post.getStatus().name();
        post.setStatus(PostStatus.INACTIVE);
        post.setUpdatedAt(Instant.now(clock));
        return new ModerationCommandResponse(toResponse(postRepository.save(post)), previous);
    }

    private ModerationCommandResponse hideComment(Comment comment) {
        if (comment.getStatus() != CommentStatus.ACTIVE) {
            throw new BadRequestException("Only active comments can be hidden");
        }
        String previous = comment.getStatus().name();
        comment.setStatus(CommentStatus.INACTIVE);
        comment.setUpdatedAt(Instant.now(clock));
        return new ModerationCommandResponse(toResponse(commentRepository.save(comment)), previous);
    }

    private ModerationCommandResponse removePost(Post post) {
        if (post.getStatus() == PostStatus.DELETED) {
            throw new BadRequestException("Post is already removed");
        }
        String previous = post.getStatus().name();
        Instant now = Instant.now(clock);
        post.setStatus(PostStatus.DELETED);
        post.setUpdatedAt(now);
        post.setDeletedAt(now);
        return new ModerationCommandResponse(toResponse(postRepository.save(post)), previous);
    }

    private ModerationCommandResponse removeComment(Comment comment) {
        if (comment.getStatus() == CommentStatus.DELETED) {
            throw new BadRequestException("Comment is already removed");
        }
        String previous = comment.getStatus().name();
        Instant now = Instant.now(clock);
        comment.setStatus(CommentStatus.DELETED);
        comment.setUpdatedAt(now);
        comment.setDeletedAt(now);
        return new ModerationCommandResponse(toResponse(commentRepository.save(comment)), previous);
    }

    private Post loadPost(String id) {
        return postRepository.findById(id).orElseThrow(() -> new NotFoundException("Post not found"));
    }

    private Comment loadComment(String id) {
        return commentRepository.findById(id).orElseThrow(() -> new NotFoundException("Comment not found"));
    }

    private ModerationContentResponse toResponse(Post post) {
        List<ModerationMediaResponse> media = post.getMedia() == null ? List.of() : post.getMedia().stream()
            .map(item -> new ModerationMediaResponse(item.getType(), item.getUrl(), item.getPublicId()))
            .toList();
        return new ModerationContentResponse(post.getId(), ModerationTargetType.POST, post.getUserId(),
            post.getContent(), media, post.getStatus().name(), post.getOriginalPostId(),
            post.getCreatedAt(), post.getUpdatedAt());
    }

    private ModerationContentResponse toResponse(Comment comment) {
        return new ModerationContentResponse(comment.getId(), ModerationTargetType.COMMENT, comment.getUserId(),
            comment.getContent(), List.of(), comment.getStatus().name(), comment.getParentCommentId(),
            comment.getCreatedAt(), comment.getUpdatedAt());
    }

    private String normalizeId(String targetId) {
        if (targetId == null || targetId.isBlank()) {
            throw new BadRequestException("Target ID is required");
        }
        return targetId.trim();
    }
}
