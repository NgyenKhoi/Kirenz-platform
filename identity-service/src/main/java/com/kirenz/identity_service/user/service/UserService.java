package com.kirenz.identity_service.user.service;

import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.media.service.CloudinaryMediaService;
import com.kirenz.identity_service.user.dto.UpdateUserProfileRequest;
import com.kirenz.identity_service.user.dto.UserProfileDTO;
import com.kirenz.identity_service.user.mapper.UserMapper;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryMediaService mediaService;
    
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

    public UserProfileDTO updateAvatar(MultipartFile file) {
        User user = getCurrentUser();
        String avatarUrl = mediaService.uploadAvatar(file).url();
        user.setAvatarUrl(avatarUrl);
        user = userRepository.save(user);
        return userMapper.toUserProfileDTO(user);
    }


    public UserProfileDTO updateCoverPhoto(MultipartFile file) {
        User user = getCurrentUser();
        String coverPhotoUrl = mediaService.uploadCover(file).url();
        user.setCoverPhotoUrl(coverPhotoUrl);
        user = userRepository.save(user);
        return userMapper.toUserProfileDTO(user);
    }
    public List<UserProfileDTO> searchProfiles(String query, UUID excludeId, Integer limit) {
        String normalizedQuery = query == null ? "" : query.trim();
        int normalizedLimit = limit == null ? 10 : Math.max(1, Math.min(limit, 20));

        return userRepository.searchProfiles(normalizedQuery, excludeId, PageRequest.of(0, normalizedLimit))
            .stream()
            .map(userMapper::toUserProfileDTO)
            .toList();
    }

    public List<UserProfileDTO> getProfilesByIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        return userRepository.findAllById(ids)
            .stream()
            .map(userMapper::toUserProfileDTO)
            .toList();
    }

    public UserProfileDTO getProfileById(UUID id) {
        return userRepository.findById(id)
            .map(userMapper::toUserProfileDTO)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    public List<UserProfileDTO> getBirthdaysToday() {
        java.time.LocalDate today = java.time.LocalDate.now();
        return userRepository.findByBirthdayMonthAndDay(today.getMonthValue(), today.getDayOfMonth())
            .stream()
            .map(userMapper::toUserProfileDTO)
            .toList();
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
