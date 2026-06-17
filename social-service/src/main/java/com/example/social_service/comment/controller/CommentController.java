package com.example.social_service.comment.controller;

import com.example.social_service.auth.CurrentUser;
import com.example.social_service.comment.dto.CommentResponse;
import com.example.social_service.comment.dto.CreateCommentRequest;
import com.example.social_service.comment.dto.UpdateCommentRequest;
import com.example.social_service.comment.service.CommentService;
import com.example.social_service.common.dto.ApiResponse;
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
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
        @PathVariable String postId,
        @Valid @RequestBody CreateCommentRequest request
    ) {
        CommentResponse response = commentService.createComment(currentUser.id(), postId, request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Comment created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> listComments(@PathVariable String postId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Comments retrieved successfully",
            commentService.listComments(postId)
        ));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
        @PathVariable String postId,
        @PathVariable String commentId,
        @Valid @RequestBody UpdateCommentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            "Comment updated successfully",
            commentService.updateComment(currentUser.id(), postId, commentId, request)
        ));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
        @PathVariable String postId,
        @PathVariable String commentId
    ) {
        commentService.deleteComment(currentUser.id(), postId, commentId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }
}
