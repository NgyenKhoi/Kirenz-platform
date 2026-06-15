package com.kirenz.user_service.friend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SendFriendRequest(
    @NotNull UUID receiverId
) {
}
