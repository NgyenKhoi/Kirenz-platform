package com.kirenz.user_service.block.dto;

import java.util.UUID;

public record BlockStatusResponse(
    UUID viewerId,
    UUID targetUserId,
    boolean blockedByViewer,
    boolean blockedViewer
) {
}
