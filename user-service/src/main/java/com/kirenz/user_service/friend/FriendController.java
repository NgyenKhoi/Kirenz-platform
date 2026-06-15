package com.kirenz.user_service.friend;

import com.kirenz.user_service.auth.CurrentUser;
import com.kirenz.user_service.common.dto.ApiResponse;
import com.kirenz.user_service.friend.dto.FriendRequestResponse;
import com.kirenz.user_service.friend.dto.FriendResponse;
import com.kirenz.user_service.friend.dto.FriendStatusResponse;
import com.kirenz.user_service.friend.dto.SendFriendRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    private final CurrentUser currentUser;

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendRequest(
        @Valid @RequestBody SendFriendRequest request
    ) {
        FriendRequestResponse response = friendService.sendRequest(currentUser.id(), request.receiverId());
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Friend request sent successfully", response));
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> incomingRequests() {
        return ResponseEntity.ok(ApiResponse.success(
            "Incoming friend requests retrieved successfully",
            friendService.incomingRequests(currentUser.id())
        ));
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> outgoingRequests() {
        return ResponseEntity.ok(ApiResponse.success(
            "Outgoing friend requests retrieved successfully",
            friendService.outgoingRequests(currentUser.id())
        ));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<ApiResponse<FriendResponse>> acceptRequest(@PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Friend request accepted successfully",
            friendService.acceptRequest(currentUser.id(), requestId)
        ));
    }

    @PostMapping("/requests/{requestId}/decline")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> declineRequest(@PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Friend request declined successfully",
            friendService.declineRequest(currentUser.id(), requestId)
        ));
    }

    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> cancelRequest(@PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Friend request cancelled successfully",
            friendService.cancelRequest(currentUser.id(), requestId)
        ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendResponse>>> listFriends() {
        return ResponseEntity.ok(ApiResponse.success(
            "Friends retrieved successfully",
            friendService.listFriends(currentUser.id())
        ));
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> unfriend(@PathVariable UUID friendId) {
        friendService.unfriend(currentUser.id(), friendId);
        return ResponseEntity.ok(ApiResponse.success("Friend removed successfully", null));
    }

    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<ApiResponse<FriendStatusResponse>> status(@PathVariable UUID targetUserId) {
        return ResponseEntity.ok(ApiResponse.success(
            "Friend status retrieved successfully",
            friendService.status(currentUser.id(), targetUserId)
        ));
    }
}
