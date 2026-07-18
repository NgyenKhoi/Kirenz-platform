package com.example.admin_service.user;

import com.example.admin_service.user.dto.AdminUserActionRequest;
import com.example.admin_service.user.dto.AdminUserResponse;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminUserControllerTest {

    private static final String SECRET = "test-secret-key-test-secret-key-123456789";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminUserManagementService adminUserManagementService;

    @Test
    void allowsAdminToBanUser() throws Exception {
        UUID userId = UUID.randomUUID();
        when(adminUserManagementService.ban(eq(userId), any(AdminUserActionRequest.class)))
            .thenReturn(user(userId, "BANNED"));

        mockMvc.perform(post("/api/admin/users/{userId}/ban", userId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"HARASSMENT\",\"note\":\"Repeated violation\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("BANNED"));
    }

    @Test
    void rejectsNonAdminBanRequest() throws Exception {
        mockMvc.perform(post("/api/admin/users/{userId}/ban", UUID.randomUUID())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"HARASSMENT\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void rejectsBlankReason() throws Exception {
        mockMvc.perform(post("/api/admin/users/{userId}/ban", UUID.randomUUID())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\" \"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
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

    private AdminUserResponse user(UUID userId, String status) {
        return new AdminUserResponse(
            userId,
            "user@kirenz.local",
            "user",
            "User",
            null,
            "USER",
            status,
            true,
            Instant.now(),
            null
        );
    }
}
