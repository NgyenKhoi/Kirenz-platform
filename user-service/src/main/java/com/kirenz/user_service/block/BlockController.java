package com.kirenz.user_service.block;

import com.kirenz.user_service.auth.CurrentUser;
import com.kirenz.user_service.block.dto.BlockResponse;
import com.kirenz.user_service.block.dto.BlockStatusResponse;
import com.kirenz.user_service.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/blocks")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;
    private final CurrentUser currentUser;

    @PostMapping("/{blockedUserId}")
    public ResponseEntity<ApiResponse<BlockResponse>> blockUser(@PathVariable UUID blockedUserId) {
        BlockResponse response = blockService.blockUser(currentUser.id(), blockedUserId);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("User blocked successfully", response));
    }

    @DeleteMapping("/{blockedUserId}")
    public ResponseEntity<ApiResponse<Void>> unblockUser(@PathVariable UUID blockedUserId) {
        blockService.unblockUser(currentUser.id(), blockedUserId);
        return ResponseEntity.ok(ApiResponse.success("User unblocked successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BlockResponse>>> listBlockedUsers() {
        return ResponseEntity.ok(ApiResponse.success(
            "Blocked users retrieved successfully",
            blockService.listBlockedUsers(currentUser.id())
        ));
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<ApiResponse<BlockStatusResponse>> status(@PathVariable UUID targetUserId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Block status retrieved successfully",
            blockService.status(currentUser.id(), targetUserId)
        ));
    }
}
