package com.kirenz.identity_service.user.dto;

import com.kirenz.identity_service.user.model.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {
    private String displayName;
    private String bio;
    private LocalDate birthDate;
    private Gender gender;
    private String location;
    private String website;
}
