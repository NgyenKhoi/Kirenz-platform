package com.kirenz.user_service.privacy.dto;

import com.kirenz.user_service.privacy.model.Visibility;
import lombok.Data;

@Data
public class UpdatePrivacySettingRequest {
    private Visibility profileVisibility;
    private Visibility postVisibility;
    private Boolean allowDirectMessages;
    private Boolean showOnlineStatus;
}
