package com.kirenz.identity_service.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleTokenInfoDTO {
    private String sub;
    private String aud;
    private String email;

    @JsonProperty("email_verified")
    private String emailVerified;

    private String name;
    private String picture;

    public boolean isEmailVerified() {
        return Boolean.parseBoolean(emailVerified);
    }
}