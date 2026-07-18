package com.example.admin_service.social;

import com.example.admin_service.common.dto.ApiResponse;
import com.example.admin_service.common.exception.DownstreamUnavailableException;
import com.example.admin_service.social.dto.SocialModerationCommandResponse;
import com.example.admin_service.social.dto.SocialModerationContentResponse;
import com.example.admin_service.social.dto.SocialModerationRequest;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
public class SocialModerationFallbackFactory implements FallbackFactory<SocialModerationClient> {

    @Override
    public SocialModerationClient create(Throwable cause) {
        return new SocialModerationClient() {
            @Override
            public ApiResponse<SocialModerationContentResponse> getContent(String targetType, String targetId) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<SocialModerationCommandResponse> hide(
                String targetType, String targetId, SocialModerationRequest request
            ) {
                throw unavailable(cause);
            }

            @Override
            public ApiResponse<SocialModerationCommandResponse> remove(
                String targetType, String targetId, SocialModerationRequest request
            ) {
                throw unavailable(cause);
            }
        };
    }

    private DownstreamUnavailableException unavailable(Throwable cause) {
        return new DownstreamUnavailableException("Social service", cause);
    }
}
