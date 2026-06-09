package com.kirenz.identity_service.user.controller;

import com.kirenz.identity_service.common.dto.ApiResponse;
import com.kirenz.identity_service.user.dto.UpdateUserProfileRequest;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}


    