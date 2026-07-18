package com.example.admin_service.health;

import java.util.UUID;

public record AdminPingResponse(
    String service,
    String status,
    UUID adminId
) {
}
