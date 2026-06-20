package com.example.social_service.post;

import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.common.exception.BadRequestException;
import com.example.social_service.common.exception.ForbiddenException;
import com.example.social_service.identity.IdentityServiceClient;
import com.example.social_service.post.dto.CreatePostRequest;
import com.example.social_service.post.dto.PostResponse;
import com.example.social_service.post.dto.SharePostRequest;
import com.example.social_service.post.dto.UpdatePostRequest;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.post.service.PostService;
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
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private IdentityServiceClient identityServiceClient;

    @Mock
    private ReactionService reactionService;

    private PostService postService;

    @BeforeEach
    void setUp() {
        postService = new PostService(postRepository, identityServiceClient, reactionService);
        lenient().when(identityServiceClient.getProfilesByIds(any())).thenReturn(ApiResponse.success("ok", List.of()));
        lenient().when(reactionService.getSummary(any(), any(), any()))
            .thenReturn(new ReactionSummaryResponse(0, null, Map.of()));
        lenient().when(reactionService.getSummaries(any(), any(), any()))
            .thenReturn(Map.of());
    }

    @Test
    void createPostSuccessfully() {
        UUID ownerId = UUID.randomUUID();
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post post = invocation.getArgument(0);
            post.setId("post-1");
            return post;
        });

        PostResponse response = postService.createPost(ownerId, new CreatePostRequest(" Hello world ", List.of()));

        assertThat(response.id()).isEqualTo("post-1");
        assertThat(response.content()).isEqualTo("Hello world");
        assertThat(response.author().id()).isEqualTo(ownerId);
        assertThat(response.createdAt()).isNotNull();
    }

    @Test
    void doesNotCreateEmptyPost() {
        UUID ownerId = UUID.randomUUID();

        assertThatThrownBy(() -> postService.createPost(ownerId, new CreatePostRequest("   ", List.of())))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Post content is required");
    }

    @Test
    void listsActivePostsNewestFirstFromRepositoryOrder() {
        Post newest = post("newest", UUID.randomUUID(), "New", Instant.parse("2026-06-16T10:00:00Z"));
        Post older = post("older", UUID.randomUUID(), "Old", Instant.parse("2026-06-15T10:00:00Z"));
        when(postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.ACTIVE)).thenReturn(List.of(newest, older));

        List<PostResponse> feed = postService.listFeed(UUID.randomUUID());

        assertThat(feed).extracting(PostResponse::id).containsExactly("newest", "older");
        verify(reactionService).getSummaries(any(), org.mockito.ArgumentMatchers.eq(ReactionTargetType.POST), any());
    }

    @Test
    void sharePostSuccessfully() {
        UUID sharerId = UUID.randomUUID();
        UUID originalOwnerId = UUID.randomUUID();
        Post original = post("post-1", originalOwnerId, "Original content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(original));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post post = invocation.getArgument(0);
            post.setId("share-1");
            return post;
        });

        PostResponse response = postService.sharePost(sharerId, "post-1", new SharePostRequest(" Great post "));

        assertThat(response.id()).isEqualTo("share-1");
        assertThat(response.author().id()).isEqualTo(sharerId);
        assertThat(response.content()).isEqualTo("Great post");
        assertThat(response.originalPostId()).isEqualTo("post-1");
        assertThat(response.sharedPost()).isNotNull();
        assertThat(response.sharedPost().available()).isTrue();
        assertThat(response.sharedPost().content()).isEqualTo("Original content");
    }

    @Test
    void sharedPostResponseHandlesDeletedOriginal() {
        UUID sharerId = UUID.randomUUID();
        Post shared = post("share-1", sharerId, "Caption", Instant.now());
        shared.setOriginalPostId("deleted-post");
        when(postRepository.findByIdAndStatus("share-1", PostStatus.ACTIVE)).thenReturn(Optional.of(shared));
        when(postRepository.findByIdAndStatus("deleted-post", PostStatus.ACTIVE)).thenReturn(Optional.empty());

        PostResponse response = postService.getPost(sharerId, "share-1");

        assertThat(response.sharedPost()).isNotNull();
        assertThat(response.sharedPost().available()).isFalse();
        assertThat(response.sharedPost().id()).isEqualTo("deleted-post");
    }

    @Test
    void ownerCanUpdatePost() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", ownerId, "Before", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PostResponse response = postService.updatePost(ownerId, "post-1", new UpdatePostRequest("After", List.of()));

        assertThat(response.content()).isEqualTo("After");
        verify(postRepository).save(post);
    }

    @Test
    void ownerCanDeletePost() {
        UUID ownerId = UUID.randomUUID();
        Post post = post("post-1", ownerId, "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> invocation.getArgument(0));

        postService.deletePost(ownerId, "post-1");

        assertThat(post.getStatus()).isEqualTo(PostStatus.DELETED);
        assertThat(post.getDeletedAt()).isNotNull();
        verify(postRepository).save(post);
    }

    @Test
    void nonOwnerCannotUpdatePost() {
        Post post = post("post-1", UUID.randomUUID(), "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.updatePost(UUID.randomUUID(), "post-1", new UpdatePostRequest("Nope", List.of())))
            .isInstanceOf(ForbiddenException.class)
            .hasMessage("Only the post owner can modify this post");
    }

    @Test
    void nonOwnerCannotDeletePost() {
        Post post = post("post-1", UUID.randomUUID(), "Content", Instant.now());
        when(postRepository.findByIdAndStatus("post-1", PostStatus.ACTIVE)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.deletePost(UUID.randomUUID(), "post-1"))
            .isInstanceOf(ForbiddenException.class)
            .hasMessage("Only the post owner can modify this post");
    }

    private Post post(String id, UUID ownerId, String content, Instant createdAt) {
        return Post.builder()
            .id(id)
            .slug("post-" + id)
            .userId(ownerId)
            .content(content)
            .media(List.of())
            .status(PostStatus.ACTIVE)
            .createdAt(createdAt)
            .updatedAt(createdAt)
            .build();
    }
}
