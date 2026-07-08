package com.kirenz.identity_service.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequestDTO {

    @NotBlank(message = "Google ID token is required")
    private String idToken;
}