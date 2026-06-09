package com.kirenz.identity_service.user.service;

import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.dto.UpdateUserProfileRequest;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserProfileDTO getCurrentUserProfile() {
        User user = getCurrentUser();
        return userMapper.toUserProfileDTO(user);
    }

    public UserProfileDTO updateUserProfile(UpdateUserProfileRequest request) {
        User user = getCurrentUser();
        userMapper.updateEntity(request, user);
        user = userRepository.save(user);
        return userMapper.toUserProfileDTO(user);
    }

    public User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        UUID userId;
        if (authentication.getPrincipal() instanceof User user) {
            userId = user.getId();
        } else if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
            userId = user.getId();
        } else {
            throw new UserNotFoundException("Unable to extract user from authentication");
        }

        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }
}

