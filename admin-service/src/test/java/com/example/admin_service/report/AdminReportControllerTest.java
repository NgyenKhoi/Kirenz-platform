package com.example.admin_service.report;

import com.example.admin_service.report.dto.ReportResponse;
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
class AdminReportControllerTest {

    private static final String SECRET = "test-secret-key-test-secret-key-123456789";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReportWorkflowService reportWorkflowService;

    @MockitoBean
    private ReportResolutionService reportResolutionService;

    @Test
    void allowsAdminToStartReview() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();
        when(reportWorkflowService.startReview(eq(adminId), eq(reportId), any()))
            .thenReturn(response(reportId, ReportStatus.REVIEWING));

        mockMvc.perform(post("/api/admin/reports/{reportId}/review", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token(adminId, "ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"adminNote\":\"Checking context\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("REVIEWING"));
    }

    @Test
    void rejectsNonAdminDismissal() throws Exception {
        mockMvc.perform(post("/api/admin/reports/{reportId}/dismiss", UUID.randomUUID())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token(UUID.randomUUID(), "USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"moderationReason\":\"OTHER\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void requiresStructuredModerationReason() throws Exception {
        mockMvc.perform(post("/api/admin/reports/{reportId}/dismiss", UUID.randomUUID())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token(UUID.randomUUID(), "ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"adminNote\":\"No violation\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("moderationReason: must not be null"));
    }

    @Test
    void allowsAdminToResolveContentReport() throws Exception {
        UUID adminId = UUID.randomUUID();
        UUID reportId = UUID.randomUUID();
        when(reportResolutionService.resolve(eq(adminId), eq(reportId), any()))
            .thenReturn(new ReportResponse(reportId, UUID.randomUUID(), ReportTargetType.POST, "post-1",
                ReportReason.HATE_SPEECH, null, ReportStatus.RESOLVED, ReportResolution.CONTENT_REMOVED,
                Instant.now(), Instant.now()));

        mockMvc.perform(post("/api/admin/reports/{reportId}/resolve", reportId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token(adminId, "ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"action\":\"REMOVE_CONTENT\",\"moderationReason\":\"HATE_SPEECH\",\"adminNote\":\"Confirmed\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("RESOLVED"))
            .andExpect(jsonPath("$.data.resolution").value("CONTENT_REMOVED"));
    }

    private String token(UUID userId, String role) {
        Instant now = Instant.now();
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
            .subject(userId.toString())
            .issuer("kirenz-identity-service")
            .claim("email", "admin@kirenz.local")
            .claim("username", "admin")
            .claim("role", role)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(300)))
            .signWith(key)
            .compact();
    }

    private ReportResponse response(UUID reportId, ReportStatus status) {
        return new ReportResponse(reportId, UUID.randomUUID(), ReportTargetType.POST, "post-1",
            ReportReason.SPAM, null, status, null, Instant.now(), Instant.now());
    }
}
