package com.example.chat_service.presence.controller;

import com.example.chat_service.common.dto.ApiResponse;
import com.example.chat_service.presence.dto.UserPresenceDto;
import com.example.chat_service.presence.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<UUID, UserPresenceDto>>> getPresence(@RequestParam Set<UUID> userIds) {
        Map<UUID, UserPresenceDto> statusMap = presenceService.getPresenceMap(userIds);
        return ResponseEntity.ok(ApiResponse.success("Presence status retrieved", statusMap));
    }
}
