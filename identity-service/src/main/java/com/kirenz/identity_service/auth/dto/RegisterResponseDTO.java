package com.kirenz.identity_service.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class RegisterResponseDTO {
    private UUID id;
    private String email;
    private String username;
    private String displayName;
    private Instant createdAt;
}
