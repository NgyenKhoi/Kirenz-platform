package com.kirenz.user_service.privacy.dto;

import com.kirenz.user_service.privacy.model.Visibility;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class PrivacySettingResponse {
    private UUID userId;
    private Visibility profileVisibility;
    private Visibility postVisibility;
    private Boolean allowDirectMessages;
    private Boolean showOnlineStatus;
    private Instant updatedAt;
}
