package com.example.chat_service.conversation.controller;

import com.example.chat_service.auth.CurrentUser;
import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.conversation.dto.ConversationResponse;
import com.example.chat_service.conversation.dto.CreateConversationRequest;
import com.example.chat_service.conversation.dto.UpdateConversationRequest;
import com.example.chat_service.conversation.dto.UpdateNicknameRequest;
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

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ConversationResponse>> updateGroupName(
        @PathVariable String id,
        @RequestBody UpdateConversationRequest request
    ) {
        ConversationResponse conversation = conversationService.updateGroupName(id, request.getName(), currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Group updated successfully", conversation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable String id) {
        conversationService.deleteGroup(id, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Group deleted successfully", null));
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<ApiResponse<ConversationResponse>> addParticipant(
        @PathVariable String id,
        @RequestParam UUID userId
    ) {
        ConversationResponse conversation = conversationService.addParticipant(id, userId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Participant added successfully", conversation));
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> removeParticipant(
        @PathVariable String id,
        @PathVariable UUID userId
    ) {
        ConversationResponse conversation = conversationService.removeParticipant(id, userId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Participant removed successfully", conversation));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(@PathVariable String id) {
        conversationService.leaveGroup(id, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Left group successfully", null));
    }

    @PostMapping("/{id}/admins/{userId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> makeAdmin(
        @PathVariable String id,
        @PathVariable UUID userId
    ) {
        ConversationResponse conversation = conversationService.makeAdmin(id, userId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Admin updated successfully", conversation));
    }

    @PatchMapping("/{id}/nicknames/{userId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> updateNickname(
        @PathVariable String id,
        @PathVariable UUID userId,
        @RequestBody UpdateNicknameRequest request
    ) {
        ConversationResponse conversation = conversationService.updateNickname(id, userId, request.getNickname(), currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Nickname updated successfully", conversation));
    }
}