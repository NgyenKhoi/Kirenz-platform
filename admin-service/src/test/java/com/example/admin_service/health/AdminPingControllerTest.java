package com.example.admin_service.health;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminPingControllerTest {

    private static final String SECRET = "test-secret-key-test-secret-key-123456789";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsUnauthenticatedRequest() throws Exception {
        mockMvc.perform(get("/api/admin/ping"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsAuthenticatedNonAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/ping")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("USER")))
            .andExpect(status().isForbidden());
    }

    @Test
    void allowsAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/ping")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.service").value("admin-service"))
            .andExpect(jsonPath("$.data.status").value("UP"));
    }

    private String token(String role) {
        Instant now = Instant.now();
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
            .subject(UUID.randomUUID().toString())
            .issuer("kirenz-identity-service")
            .claim("email", "admin@kirenz.local")
            .claim("username", "admin")
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(300)))
            .signWith(key)
            .compact();
    }
}
