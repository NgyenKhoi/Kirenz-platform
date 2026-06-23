package com.example.chat_service.conversation.controller;

import com.example.chat_service.auth.CurrentUser;
import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.conversation.dto.ConversationResponse;
import com.example.chat_service.conversation.dto.CreateConversationRequest;
import com.example.chat_service.conversation.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
        @Valid @RequestBody CreateConversationRequest request
    ) {
        ConversationResponse conversation = conversationService.createConversation(request, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Conversation created successfully", conversation));
    }

    @PostMapping("/direct/{otherUserId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getOrCreateDirectConversation(
        @PathVariable UUID otherUserId
    ) {
        ConversationResponse conversation = conversationService.getOrCreateDirectConversation(currentUser.id(), otherUserId);
        return ResponseEntity.ok(ApiResponse.success("Direct conversation retrieved", conversation));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getUserConversations() {
        List<ConversationResponse> conversations = conversationService.getUserConversations(currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved successfully", conversations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversationById(@PathVariable String id) {
        ConversationResponse conversation = conversationService.getConversationById(id, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Conversation details retrieved", conversation));
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<Void>> addParticipant(
        @PathVariable String id,
        @RequestParam UUID userId
    ) {
        conversationService.addParticipant(id, userId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Participant added successfully", null));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeParticipant(
        @PathVariable String id,
        @PathVariable UUID userId
    ) {
        conversationService.removeParticipant(id, userId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Participant removed successfully", null));
    }
}
