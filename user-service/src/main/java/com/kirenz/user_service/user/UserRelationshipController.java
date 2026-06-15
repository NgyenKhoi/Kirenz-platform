package com.kirenz.user_service.user;

import com.kirenz.user_service.auth.CurrentUser;
import com.kirenz.user_service.common.dto.ApiResponse;
import com.kirenz.user_service.friend.FriendService;
import com.kirenz.user_service.friend.dto.MutualFriendResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRelationshipController {

    private final FriendService friendService;
    private final CurrentUser currentUser;

    @GetMapping("/{targetUserId}/mutual-friends")
    public ResponseEntity<ApiResponse<List<MutualFriendResponse>>> mutualFriends(@PathVariable UUID targetUserId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Mutual friends retrieved successfully",
            friendService.mutualFriends(currentUser.id(), targetUserId)
        ));
    }
}
