package com.example.social_service.user;

import java.util.UUID;

public record BlockStatusResponse(
    UUID viewerId,
    UUID targetUserId,
    boolean blockedByViewer,
    boolean blockedViewer
) {
}
