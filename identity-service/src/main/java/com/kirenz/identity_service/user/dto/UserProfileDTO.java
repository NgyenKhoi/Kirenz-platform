package com.kirenz.identity_service.user.dto;

import com.kirenz.identity_service.user.model.Gender;
import com.kirenz.identity_service.user.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private UUID id;
    private String email;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private LocalDate birthDate;
    private Gender gender;
    private String location;
    private String website;
    private UserRole role;
    private Boolean emailVerified;
    private Instant createdAt;
    private Instant updatedAt;
}
