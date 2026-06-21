package com.kirenz.identity_service.user.controller;

import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.user.dto.UpdateUserProfileRequest;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getCurrentUser() {
        UserProfileDTO profile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
        @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        UserProfileDTO profile = userService.updateUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success("User profile updated successfully", profile));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateAvatar(@RequestParam("file") MultipartFile file) {
        UserProfileDTO profile = userService.updateAvatar(file);
        return ResponseEntity.ok(ApiResponse.success("Avatar updated successfully", profile));
    }

    @GetMapping("/internal/search")
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> searchProfiles(
        @RequestParam("q") String query,
        @RequestParam("excludeId") UUID excludeId,
        @RequestParam(value = "limit", required = false) Integer limit
    ) {
        List<UserProfileDTO> profiles = userService.searchProfiles(query, excludeId, limit);
        return ResponseEntity.ok(ApiResponse.success("User profiles retrieved successfully", profiles));
    }

    @GetMapping("/internal/profiles")
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> getProfilesByIds(@RequestParam List<UUID> ids) {
        List<UserProfileDTO> profiles = userService.getProfilesByIds(ids);
        return ResponseEntity.ok(ApiResponse.success("User profiles retrieved successfully", profiles));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserProfile(@PathVariable UUID userId) {
        UserProfileDTO profile = userService.getProfileById(userId);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
    }
}