package com.example.notification_service.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private static final String ISSUER = "kirenz-identity-service";

    @Value("${jwt.secret}")
    private String secret;

    public JwtPrincipal parse(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();

        if (!ISSUER.equals(claims.getIssuer()) || claims.getExpiration().before(new Date())) {
            throw new IllegalArgumentException("Invalid token");
        }

        return new JwtPrincipal(
            UUID.fromString(claims.getSubject()),
            claims.get("email", String.class),
            claims.get("username", String.class),
            claims.get("role", String.class)
        );
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
