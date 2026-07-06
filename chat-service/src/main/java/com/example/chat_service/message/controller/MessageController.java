package com.example.chat_service.message.controller;

import com.example.chat_service.auth.CurrentUser;
import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.message.dto.MessageResponse;
import com.example.chat_service.message.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ChatService chatService;
    private final CurrentUser currentUser;

    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessageHistory(
        @PathVariable String conversationId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        List<MessageResponse> history = chatService.getMessageHistory(conversationId, currentUser.id(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Message history retrieved", history));
    }

    @PostMapping("/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String conversationId) {
        chatService.markMessagesAsRead(conversationId, currentUser.id());
        return ResponseEntity.ok(ApiResponse.success("Conversation marked as read", null));
    }
}
