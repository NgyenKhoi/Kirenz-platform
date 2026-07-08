package com.example.social_service.reaction.controller;

import com.example.social_service.auth.CurrentUser;
import com.example.social_service.common.dto.ApiResponse;
import com.example.social_service.reaction.dto.ReactionRequest;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;
import com.example.social_service.reaction.dto.ReactionUserResponse;
import com.example.social_service.reaction.service.ReactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionService reactionService;
    private final CurrentUser currentUser;

    @GetMapping("/posts/{postId}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionUserResponse>>> getPostReactions(@PathVariable String postId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Post reactions retrieved successfully",
            reactionService.getPostReactionUsers(currentUser.id(), postId)
        ));
    }

    @PostMapping("/posts/{postId}/reactions")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> reactToPost(
        @PathVariable String postId,
        @Valid @RequestBody ReactionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            "Post reaction updated successfully",
            reactionService.reactToPost(currentUser.id(), postId, request)
        ));
    }

    @PatchMapping("/posts/{postId}/reactions")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> updatePostReaction(
        @PathVariable String postId,
        @Valid @RequestBody ReactionRequest request
    ) {
        return reactToPost(postId, request);
    }

    @DeleteMapping("/posts/{postId}/reactions/me")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> unreactToPost(@PathVariable String postId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Post reaction removed successfully",
            reactionService.unreactToPost(currentUser.id(), postId)
        ));
    }

    @GetMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionUserResponse>>> getCommentReactions(@PathVariable String commentId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Comment reactions retrieved successfully",
            reactionService.getCommentReactionUsers(currentUser.id(), commentId)
        ));
    }

    @PostMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> reactToComment(
        @PathVariable String commentId,
        @Valid @RequestBody ReactionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            "Comment reaction updated successfully",
            reactionService.reactToComment(currentUser.id(), commentId, request)
        ));
    }

    @PatchMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> updateCommentReaction(
        @PathVariable String commentId,
        @Valid @RequestBody ReactionRequest request
    ) {
        return reactToComment(commentId, request);
    }

    @DeleteMapping("/comments/{commentId}/reactions/me")
    public ResponseEntity<ApiResponse<ReactionSummaryResponse>> unreactToComment(@PathVariable String commentId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Comment reaction removed successfully",
            reactionService.unreactToComment(currentUser.id(), commentId)
        ));
    }
}
