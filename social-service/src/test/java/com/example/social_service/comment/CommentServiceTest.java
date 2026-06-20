package com.example.social_service.comment;

import com.example.social_service.comment.dto.CommentResponse;
import com.example.social_service.comment.dto.CreateCommentRequest;
import com.example.social_service.comment.dto.UpdateCommentRequest;
import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.comment.service.CommentService;
import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.ForbiddenException;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.model.ReactionTargetType;
import com.example.social_service.reaction.service.ReactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private IdentityServiceClient identityServiceClient;

    @Mock
    private ReactionService reactionService;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, postRepository, identityServiceClient, reactionService);
        lenient().when(identityServiceClient.getProfilesByIds(any())).thenReturn(ApiResponse.success("ok", List.of()));
        lenient().when(reactionService.getSummary(any(), any(), any()))
            .thenReturn(new ReactionSummaryResponse(0, null, Map.of()));
        lenient().when(reactionService.getSummaries(any(), any(), any()))
            .thenReturn(Map.of());
        lenient().when(commentRepository.findByParentCommentIdAndStatus(any(), any())).thenReturn(List.of());
    }

    @Test
    void createCommentSuccessfully() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", 0);
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment comment = invocation.getArgument(0);
            comment.setId("comment-1");
            return comment;
        });

        CommentResponse response = commentService.createComment(
            ownerId,
            "post-1",
            new CreateCommentRequest(" First! ", null)
        );

        assertThat(response.id()).isEqualTo("comment-1");
        assertThat(response.content()).isEqualTo("First!");
        assertThat(response.author().id()).isEqualTo(ownerId);
        assertThat(post.getCommentsCount()).isEqualTo(1);
        verify(postRepository).save(post);
    }

    @Test
    void doesNotCreateEmptyComment() {
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 0)));

        assertThatThrownBy(() -> commentService.createComment(
            UUID.randomUUID(),
            "post-1",
            new CreateCommentRequest("   ", null)
        ))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Comment content is required");
    }

    @Test
    void createReplySuccessfully() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", 1);
        Comment parent = comment("comment-1", "post-1", UUID.randomUUID(), "Parent", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(parent));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> {
            Comment comment = invocation.getArgument(0);
            comment.setId("reply-1");
            return comment;
        });

        CommentResponse response = commentService.createComment(
            ownerId,
            "post-1",
            new CreateCommentRequest(" Reply! ", "comment-1")
        );

        assertThat(response.id()).isEqualTo("reply-1");
        assertThat(response.parentCommentId()).isEqualTo("comment-1");
        assertThat(response.content()).isEqualTo("Reply!");
        assertThat(post.getCommentsCount()).isEqualTo(2);
        verify(postRepository).save(post);
    }

    @Test
    void doesNotCreateCommentForMissingPost() {
        when(postRepository.findByIdAndStatus("missing", PostStatus.ACTIVE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.createComment(
            UUID.randomUUID(),
            "missing",
            new CreateCommentRequest("Hello", null)
        ))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Post not found");
    }

    @Test
    void listsCommentsForPostOldestFirstFromRepositoryOrder() {
        UUID firstOwner = UUID.randomUUID();
        UUID secondOwner = UUID.randomUUID();
        Comment first = comment("comment-1", "post-1", firstOwner, "First", Instant.parse("2026-06-16T10:00:00Z"));
        Comment second = comment("comment-2", "post-1", secondOwner, "Second", Instant.parse("2026-06-16T11:00:00Z"));
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 2)));
        when(commentRepository.findByPostIdAndStatusOrderByCreatedAtAsc("post-1", CommentStatus.ACTIVE))
            .thenReturn(List.of(first, second));

        List<CommentResponse> comments = commentService.listComments(UUID.randomUUID(), "post-1");

        assertThat(comments).extracting(CommentResponse::id).containsExactly("comment-1", "comment-2");
        verify(reactionService).getSummaries(any(), org.mockito.ArgumentMatchers.eq(ReactionTargetType.COMMENT), any());
    }

    @Test
    void ownerCanUpdateComment() {
        UUID ownerId = UUID.randomUUID();
        Comment comment = comment("comment-1", "post-1", ownerId, "Before", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 1)));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommentResponse response = commentService.updateComment(
            ownerId,
            "post-1",
            "comment-1",
            new UpdateCommentRequest("After")
        );

        assertThat(response.content()).isEqualTo("After");
        verify(commentRepository).save(comment);
    }

    @Test
    void ownerCanDeleteCommentAndDecrementsPostCount() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", 3);
        Comment comment = comment("comment-1", "post-1", ownerId, "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(comment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        commentService.deleteComment(ownerId, "post-1", "comment-1");

        assertThat(comment.getStatus()).isEqualTo(CommentStatus.DELETED);
        assertThat(comment.getDeletedAt()).isNotNull();
        assertThat(post.getCommentsCount()).isEqualTo(2);
        verify(commentRepository).save(comment);
        verify(postRepository).save(post);
    }

    @Test
    void ownerCanDeleteCommentAndItsReplies() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", 3);
        Comment parent = comment("comment-1", "post-1", ownerId, "Content", Instant.now());
        Comment reply = comment("reply-1", "post-1", UUID.randomUUID(), "Reply", Instant.now());
        reply.setParentCommentId("comment-1");
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(parent));
        when(commentRepository.findByParentCommentIdAndStatus("comment-1", CommentStatus.ACTIVE))
            .thenReturn(List.of(reply));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        commentService.deleteComment(ownerId, "post-1", "comment-1");

        assertThat(parent.getStatus()).isEqualTo(CommentStatus.DELETED);
        assertThat(reply.getStatus()).isEqualTo(CommentStatus.DELETED);
        assertThat(post.getCommentsCount()).isEqualTo(1);
        verify(commentRepository).save(parent);
        verify(commentRepository).save(reply);
        verify(postRepository).save(post);
    }

    @Test
    void nonOwnerCannotUpdateComment() {
        Comment comment = comment("comment-1", "post-1", UUID.randomUUID(), "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 1)));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.updateComment(
            UUID.randomUUID(),
            "post-1",
            "comment-1",
            new UpdateCommentRequest("Nope")
        ))
            .isInstanceOf(ForbiddenException.class)
            .hasMessage("Only the comment owner can modify this comment");
    }

    @Test
    void nonOwnerCannotDeleteComment() {
        Comment comment = comment("comment-1", "post-1", UUID.randomUUID(), "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 1)));
        when(commentRepository.findByIdAndPostIdAndStatus("comment-1", "post-1", CommentStatus.ACTIVE))
            .thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(UUID.randomUUID(), "post-1", "comment-1"))
            .isInstanceOf(ForbiddenException.class)
            .hasMessage("Only the comment owner can modify this comment");
    }

    private Post post(String id, int commentsCount) {
        return Post.builder()
            .id(id)
            .slug("post-" + id)
            .userId(UUID.randomUUID())
            .content("Post content")
            .commentsCount(commentsCount)
            .status(PostStatus.ACTIVE)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private Comment comment(String id, String postId, UUID ownerId, String content, Instant createdAt) {
        return Comment.builder()
            .id(id)
            .postId(postId)
            .userId(ownerId)
            .content(content)
            .status(CommentStatus.ACTIVE)
            .createdAt(createdAt)
            .updatedAt(createdAt)
            .build();
    }
}
