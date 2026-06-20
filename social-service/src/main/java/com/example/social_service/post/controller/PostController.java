package com.example.social_service.post.controller;

import com.example.social_service.auth.CurrentUser;
import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.post.dto.CreatePostRequest;
import com.example.social_service.post.dto.PostResponse;
import com.example.social_service.post.dto.SharePostRequest;
import com.example.social_service.post.dto.UpdatePostRequest;
import com.example.social_service.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
        @Valid @RequestBody CreatePostRequest request
    ) {
        PostResponse response = postService.createPost(currentUser.id(), request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> feed() {
        return ResponseEntity.ok(ApiResponse.success(
            "Posts retrieved successfully",
            postService.listFeed(currentUser.id())
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PostResponse>>> myPosts() {
        return ResponseEntity.ok(ApiResponse.success(
            "Current user posts retrieved successfully",
            postService.listMyPosts(currentUser.id())
        ));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> detail(@PathVariable String postId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Post retrieved successfully",
            postService.getPost(currentUser.id(), postId)
        ));
    }

    @PostMapping("/{postId}/shares")
    public ResponseEntity<ApiResponse<PostResponse>> sharePost(
        @PathVariable String postId,
        @RequestBody(required = false) SharePostRequest request
    ) {
        PostResponse response = postService.sharePost(currentUser.id(), postId, request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post shared successfully", response));
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
        @PathVariable String postId,
        @Valid @RequestBody UpdatePostRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            "Post updated successfully",
            postService.updatePost(currentUser.id(), postId, request)
        ));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String postId) {
        postService.deletePost(currentUser.id(), postId);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }
}
