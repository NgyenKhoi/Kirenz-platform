package com.kirenz.user_service.user;

import com.kirenz.user_service.common.exception.BadRequestException;
import com.kirenz.user_service.friend.FriendService;
import com.kirenz.user_service.identity.IdentityServiceClient;
import com.kirenz.user_service.identity.IdentityUserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSearchService {

    private static final int DEFAULT_LIMIT = 10;
    private static final int MAX_LIMIT = 20;

    private final IdentityServiceClient identityServiceClient;
    private final FriendService friendService;

    public List<UserSearchResponse> search(UUID currentUserId, String query, Integer limit) {
        String normalizedQuery = query == null ? "" : query.trim();
        if (normalizedQuery.length() < 2) {
            throw new BadRequestException("Search query must be at least 2 characters");
        }

        int normalizedLimit = normalizeLimit(limit);
        List<IdentityUserProfileResponse> profiles = identityServiceClient
            .searchProfiles(normalizedQuery, currentUserId, normalizedLimit)
            .getData();

        return profiles.stream()
            .map(profile -> toResponse(currentUserId, profile))
            .toList();
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null) {
            return DEFAULT_LIMIT;
        }
        if (limit < 1) {
            throw new BadRequestException("Limit must be greater than 0");
        }
        return Math.min(limit, MAX_LIMIT);
    }

    private UserSearchResponse toResponse(UUID currentUserId, IdentityUserProfileResponse profile) {
        String relationshipStatus = friendService.status(currentUserId, profile.id()).status();
        return new UserSearchResponse(
            profile.id(),
            profile.username(),
            profile.displayName(),
            profile.avatarUrl(),
            profile.bio(),
            relationshipStatus
        );
    }
}