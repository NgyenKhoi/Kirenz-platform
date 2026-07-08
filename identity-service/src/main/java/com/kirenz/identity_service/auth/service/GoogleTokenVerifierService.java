package com.kirenz.identity_service.auth.service;

import com.kirenz.identity_service.auth.dto.GoogleTokenInfoDTO;
import com.kirenz.identity_service.common.exception.InvalidTokenException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
public class GoogleTokenVerifierService {

    private final RestClient.Builder restClientBuilder;

    @Value("${google.oauth.client-id}")
    private String googleClientId;

    public GoogleTokenInfoDTO verify(String idToken) {
        GoogleTokenInfoDTO tokenInfo;
        try {
            tokenInfo = restClientBuilder.build()
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("oauth2.googleapis.com")
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken)
                            .build())
                    .retrieve()
                    .body(GoogleTokenInfoDTO.class);
        } catch (RestClientException ex) {
            throw new InvalidTokenException("Invalid Google ID token");
        }

        if (tokenInfo == null || tokenInfo.getSub() == null || tokenInfo.getSub().isBlank()) {
            throw new InvalidTokenException("Invalid Google ID token");
        }
        if (!googleClientId.equals(tokenInfo.getAud())) {
            throw new InvalidTokenException("Google ID token audience is not allowed");
        }
        if (tokenInfo.getEmail() == null || tokenInfo.getEmail().isBlank()) {
            throw new InvalidTokenException("Google account does not expose an email");
        }
        if (!tokenInfo.isEmailVerified()) {
            throw new InvalidTokenException("Google account email is not verified");
        }

        return tokenInfo;
    }
}