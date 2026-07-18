package com.kirenz.identity_service.admin.service;

import com.kirenz.identity_service.admin.dto.AdminUserResponse;
import com.kirenz.identity_service.common.exception.BadRequestException;
import com.kirenz.identity_service.common.exception.UserNotFoundException;
import com.kirenz.identity_service.user.model.AccountStatus;
import com.kirenz.identity_service.user.model.User;
import com.kirenz.identity_service.user.model.UserRole;
import com.kirenz.identity_service.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserCommandService {

    private final UserRepository userRepository;

    @Transactional
    public AdminUserResponse ban(UUID userId, UUID adminId) {
        User user = getManageableUser(userId, adminId);
        if (user.getStatus() == AccountStatus.BANNED) {
            throw new BadRequestException("Account is already banned");
        }

        user.setStatus(AccountStatus.BANNED);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse unban(UUID userId, UUID adminId) {
        User user = getManageableUser(userId, adminId);
        if (user.getStatus() != AccountStatus.BANNED) {
            throw new BadRequestException("Only banned accounts can be unbanned");
        }

        user.setStatus(AccountStatus.ACTIVE);
        return toResponse(userRepository.save(user));
    }

    private User getManageableUser(UUID userId, UUID adminId) {
        if (userId.equals(adminId)) {
            throw new BadRequestException("Administrators cannot change their own account status");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be managed from this action");
        }
        return user;
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getProfileUsername(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getRole(),
            user.getStatus(),
            Boolean.TRUE.equals(user.getEmailVerified()),
            user.getCreatedAt(),
            user.getLastLoginAt()
        );
    }
}
