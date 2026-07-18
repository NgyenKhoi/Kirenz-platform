package com.example.social_service.moderation;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.post.model.MediaType;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostMedia;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContentModerationServiceTest {

    private static final Instant NOW = Instant.parse("2026-07-18T12:00:00Z");

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    private ContentModerationService moderationService;

    @BeforeEach
    void setUp() {
        moderationService = new ContentModerationService(postRepository, commentRepository,
            Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void loadsRestrictedPostWithAttachedMedia() {
        Post post = post(PostStatus.INACTIVE);
        post.setMedia(List.of(PostMedia.builder()
            .type(MediaType.IMAGE)
            .url("https://cdn.example/post.jpg")
            .publicId("post-image")
            .build()));
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        var response = moderationService.getDetail(ModerationTargetType.POST, post.getId());

        assertThat(response.status()).isEqualTo("INACTIVE");
        assertThat(response.media()).hasSize(1);
        assertThat(response.media().getFirst().publicId()).isEqualTo("post-image");
    }

    @Test
    void hidesActiveComment() {
        Comment comment = comment(CommentStatus.ACTIVE);
        when(commentRepository.findById(comment.getId())).thenReturn(Optional.of(comment));
        when(commentRepository.save(comment)).thenReturn(comment);

        var response = moderationService.hide(ModerationTargetType.COMMENT, comment.getId());

        assertThat(response.previousStatus()).isEqualTo("ACTIVE");
        assertThat(response.content().status()).isEqualTo("INACTIVE");
        assertThat(comment.getUpdatedAt()).isEqualTo(NOW);
    }

    @Test
    void removesHiddenPost() {
        Post post = post(PostStatus.INACTIVE);
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));
        when(postRepository.save(post)).thenReturn(post);

        var response = moderationService.remove(ModerationTargetType.POST, post.getId());

        assertThat(response.previousStatus()).isEqualTo("INACTIVE");
        assertThat(response.content().status()).isEqualTo("DELETED");
        assertThat(post.getDeletedAt()).isEqualTo(NOW);
    }

    @Test
    void rejectsHidingRemovedContent() {
        Post post = post(PostStatus.DELETED);
        when(postRepository.findById(post.getId())).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> moderationService.hide(ModerationTargetType.POST, post.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Only active posts can be hidden");
    }

    private Post post(PostStatus status) {
        return Post.builder()
            .id("post-1")
            .userId(UUID.randomUUID())
            .content("content")
            .status(status)
            .createdAt(NOW.minusSeconds(3600))
            .updatedAt(NOW.minusSeconds(3600))
            .build();
    }

    private Comment comment(CommentStatus status) {
        return Comment.builder()
            .id("comment-1")
            .postId("post-1")
            .userId(UUID.randomUUID())
            .content("comment")
            .status(status)
            .createdAt(NOW.minusSeconds(1800))
            .updatedAt(NOW.minusSeconds(1800))
            .build();
    }
}
