package com.example.social_service.reaction;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.common.exception.NotFoundException;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.dto.ReactionRequest;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.model.Reaction;
import com.example.social_service.reaction.model.ReactionTargetType;
import com.example.social_service.reaction.model.ReactionType;
import com.example.social_service.reaction.repository.ReactionRepository;
import com.example.social_service.reaction.service.ReactionService;
import com.example.social_service.user.UserServiceClient;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReactionServiceTest {

    @Mock
    private ReactionRepository reactionRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private IdentityServiceClient identityServiceClient;

    @Mock
    private com.example.social_service.event.NotificationProducer notificationProducer;

    private ReactionService reactionService;

    @BeforeEach
    void setUp() {
        reactionService = new ReactionService(reactionRepository, postRepository, commentRepository, userServiceClient, identityServiceClient, notificationProducer);
    }

    @Test
    void createsPostReactionSuccessfully() {
        UUID userId = UUID.randomUUID();
        Post post = post("post-1", 0);
        Reaction savedReaction = reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.LIKE);
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.POST, "post-1"))
            .thenReturn(Optional.empty(), Optional.of(savedReaction));
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, "post-1"))
            .thenReturn(List.of(savedReaction));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReactionSummaryResponse response = reactionService.reactToPost(
            userId,
            "post-1",
            new ReactionRequest(ReactionType.LIKE)
        );

        assertThat(post.getReactionsCount()).isEqualTo(1);
        assertThat(response.totalCount()).isEqualTo(1);
        assertThat(response.currentUserReaction()).isEqualTo(ReactionType.LIKE);
        assertThat(response.breakdown()).containsEntry(ReactionType.LIKE, 1L);
        verify(reactionRepository).save(any(Reaction.class));
        verify(postRepository).save(post);
    }

    @Test
    void targetNotFoundFails() {
        when(postRepository.findByIdAndStatus("missing", PostStatus.ACTIVE)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reactionService.reactToPost(
            UUID.randomUUID(),
            "missing",
            new ReactionRequest(ReactionType.LOVE)
        ))
            .isInstanceOf(NotFoundException.class)
            .hasMessage("Post not found");
    }

    @Test
    void changesExistingReactionTypeWithoutChangingCount() {
        UUID userId = UUID.randomUUID();
        Post post = post("post-1", 1);
        Reaction existing = reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.LIKE);
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.POST, "post-1"))
            .thenReturn(Optional.of(existing));
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, "post-1"))
            .thenReturn(List.of(reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.LOVE)));

        ReactionSummaryResponse response = reactionService.reactToPost(
            userId,
            "post-1",
            new ReactionRequest(ReactionType.LOVE)
        );

        assertThat(existing.getType()).isEqualTo(ReactionType.LOVE);
        assertThat(post.getReactionsCount()).isEqualTo(1);
        assertThat(response.breakdown()).containsEntry(ReactionType.LOVE, 1L);
        verify(reactionRepository).save(existing);
        verify(postRepository, never()).save(post);
    }

    @Test
    void choosingSameReactionDeletesIt() {
        UUID userId = UUID.randomUUID();
        Post post = post("post-1", 1);
        Reaction existing = reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.HAHA);
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.POST, "post-1"))
            .thenReturn(Optional.of(existing), Optional.empty());
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, "post-1"))
            .thenReturn(List.of());
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReactionSummaryResponse response = reactionService.reactToPost(
            userId,
            "post-1",
            new ReactionRequest(ReactionType.HAHA)
        );

        assertThat(post.getReactionsCount()).isZero();
        assertThat(response.totalCount()).isZero();
        assertThat(response.currentUserReaction()).isNull();
        verify(reactionRepository).delete(existing);
        verify(postRepository).save(post);
    }

    @Test
    void unreactDeletesExistingReaction() {
        UUID userId = UUID.randomUUID();
        Post post = post("post-1", 2);
        Reaction existing = reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.WOW);
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.POST, "post-1"))
            .thenReturn(Optional.of(existing), Optional.empty());
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, "post-1"))
            .thenReturn(List.of(reaction(UUID.randomUUID(), "post-1", ReactionTargetType.POST, ReactionType.SAD)));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReactionSummaryResponse response = reactionService.unreactToPost(userId, "post-1");

        assertThat(post.getReactionsCount()).isEqualTo(1);
        assertThat(response.totalCount()).isEqualTo(1);
        assertThat(response.currentUserReaction()).isNull();
        assertThat(response.breakdown()).containsEntry(ReactionType.SAD, 1L);
        verify(reactionRepository).delete(existing);
        verify(postRepository).save(post);
    }

    @Test
    void createsCommentReactionSuccessfully() {
        UUID userId = UUID.randomUUID();
        Comment comment = comment("comment-1", "post-1", 0);
        Reaction savedReaction = reaction(userId, "comment-1", ReactionTargetType.COMMENT, ReactionType.ANGRY);
        when(commentRepository.findByIdAndStatus("comment-1", CommentStatus.ACTIVE)).thenReturn(Optional.of(comment));
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post("post-1", 0)));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.COMMENT, "comment-1"))
            .thenReturn(Optional.empty(), Optional.of(savedReaction));
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.COMMENT, "comment-1"))
            .thenReturn(List.of(savedReaction));

        ReactionSummaryResponse response = reactionService.reactToComment(
            userId,
            "comment-1",
            new ReactionRequest(ReactionType.ANGRY)
        );

        assertThat(comment.getReactionsCount()).isEqualTo(1);
        assertThat(response.currentUserReaction()).isEqualTo(ReactionType.ANGRY);
        assertThat(response.breakdown()).containsEntry(ReactionType.ANGRY, 1L);
        verify(commentRepository).save(comment);
    }

    @Test
    void summaryIncludesCurrentUserReactionAndBreakdown() {
        UUID userId = UUID.randomUUID();
        Reaction current = reaction(userId, "post-1", ReactionTargetType.POST, ReactionType.LOVE);
        when(reactionRepository.findByTargetTypeAndTargetId(ReactionTargetType.POST, "post-1"))
            .thenReturn(List.of(
                current,
                reaction(UUID.randomUUID(), "post-1", ReactionTargetType.POST, ReactionType.LOVE),
                reaction(UUID.randomUUID(), "post-1", ReactionTargetType.POST, ReactionType.WOW)
            ));
        when(reactionRepository.findByUserIdAndTargetTypeAndTargetId(userId, ReactionTargetType.POST, "post-1"))
            .thenReturn(Optional.of(current));

        ReactionSummaryResponse response = reactionService.getSummary(userId, ReactionTargetType.POST, "post-1");

        assertThat(response.totalCount()).isEqualTo(3);
        assertThat(response.currentUserReaction()).isEqualTo(ReactionType.LOVE);
        assertThat(response.breakdown()).containsEntry(ReactionType.LOVE, 2L);
        assertThat(response.breakdown()).containsEntry(ReactionType.WOW, 1L);
    }

    private Post post(String id, int reactionsCount) {
        return Post.builder()
            .id(id)
            .slug("post-" + id)
            .userId(UUID.randomUUID())
            .content("Post content")
            .reactionsCount(reactionsCount)
            .status(PostStatus.ACTIVE)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private Comment comment(String id, String postId, int reactionsCount) {
        return Comment.builder()
            .id(id)
            .postId(postId)
            .userId(UUID.randomUUID())
            .content("Comment content")
            .reactionsCount(reactionsCount)
            .status(CommentStatus.ACTIVE)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    private Reaction reaction(UUID userId, String targetId, ReactionTargetType targetType, ReactionType type) {
        return Reaction.builder()
            .id(UUID.randomUUID().toString())
            .userId(userId)
            .targetId(targetId)
            .targetType(targetType)
            .type(type)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }
}
