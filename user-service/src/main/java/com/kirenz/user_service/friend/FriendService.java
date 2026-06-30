package com.kirenz.user_service.friend;

import com.kirenz.user_service.block.repository.BlockRepository;
import com.kirenz.user_service.common.exception.BadRequestException;
import com.kirenz.user_service.common.exception.ConflictException;
import com.kirenz.user_service.common.exception.ForbiddenException;
import com.kirenz.user_service.common.exception.NotFoundException;
import com.kirenz.user_service.friend.dto.FriendRequestResponse;
import com.kirenz.user_service.friend.dto.FriendResponse;
import com.kirenz.user_service.friend.dto.FriendStatusResponse;
import com.kirenz.user_service.friend.dto.FriendSuggestionResponse;
import com.kirenz.user_service.friend.dto.MutualFriendResponse;
import com.kirenz.user_service.friend.model.FriendRequest;
import com.kirenz.user_service.friend.model.FriendRequestStatus;
import com.kirenz.user_service.friend.model.Friendship;
import com.kirenz.user_service.friend.repository.FriendRequestRepository;
import com.kirenz.user_service.friend.repository.FriendshipRepository;
import com.kirenz.user_service.identity.IdentityServiceClient;
import com.kirenz.user_service.identity.IdentityUserProfileResponse;
import com.kirenz.user_service.event.NotificationEvent;
import com.kirenz.user_service.event.NotificationProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final BlockRepository blockRepository;
    private final IdentityServiceClient identityServiceClient;
    private final NotificationProducer notificationProducer;

    @Transactional
    public FriendRequestResponse sendRequest(UUID requesterId, UUID receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new BadRequestException("Cannot send a friend request to yourself");
        }

        ensureNotBlocked(requesterId, receiverId, "Cannot send a friend request when either user has blocked the other");

        UserPair pair = UserPair.of(requesterId, receiverId);
        if (friendshipRepository.existsByUserId1AndUserId2(pair.userId1(), pair.userId2())) {
            throw new ConflictException("Users are already friends");
        }

        if (friendRequestRepository.existsByRequesterIdAndReceiverIdAndStatus(requesterId, receiverId, FriendRequestStatus.PENDING)) {
            throw new ConflictException("Friend request already exists");
        }

        if (friendRequestRepository.existsByRequesterIdAndReceiverIdAndStatus(receiverId, requesterId, FriendRequestStatus.PENDING)) {
            throw new ConflictException("The target user already sent you a friend request");
        }

        FriendRequest request = FriendRequest.builder()
            .requesterId(requesterId)
            .receiverId(receiverId)
            .status(FriendRequestStatus.PENDING)
            .build();

        FriendRequest saved = friendRequestRepository.save(request);
        NotificationEvent event = NotificationEvent.builder()
            .type("FRIEND_REQUEST")
            .actorId(requesterId)
            .receiverId(receiverId)
            .targetId(saved.getId().toString())
            .message("sent you a friend request.")
            .createdAt(Instant.now())
            .build();
        notificationProducer.sendNotification(event);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> incomingRequests(UUID userId) {
        List<FriendRequest> requests = friendRequestRepository
            .findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING);
        // For incoming requests, the "other" user is the requester
        List<UUID> otherUserIds = requests.stream().map(FriendRequest::getRequesterId).toList();
        Map<UUID, IdentityUserProfileResponse> profiles = fetchProfilesMap(otherUserIds);
        return requests.stream()
            .map(r -> toEnrichedResponse(r, profiles.get(r.getRequesterId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> outgoingRequests(UUID userId) {
        List<FriendRequest> requests = friendRequestRepository
            .findByRequesterIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING);
        // For outgoing requests, the "other" user is the receiver
        List<UUID> otherUserIds = requests.stream().map(FriendRequest::getReceiverId).toList();
        Map<UUID, IdentityUserProfileResponse> profiles = fetchProfilesMap(otherUserIds);
        return requests.stream()
            .map(r -> toEnrichedResponse(r, profiles.get(r.getReceiverId())))
            .toList();
    }

    @Transactional
    public FriendResponse acceptRequest(UUID userId, UUID requestId) {
        FriendRequest request = friendRequestRepository
            .findByIdAndReceiverIdAndStatus(requestId, userId, FriendRequestStatus.PENDING)
            .orElseThrow(() -> new NotFoundException("Pending friend request not found"));

        ensureNotBlocked(userId, request.getRequesterId(), "Cannot accept a friend request when either user has blocked the other");

        UserPair pair = UserPair.of(request.getRequesterId(), request.getReceiverId());
        if (friendshipRepository.existsByUserId1AndUserId2(pair.userId1(), pair.userId2())) {
            request.setStatus(FriendRequestStatus.ACCEPTED);
            request.setRespondedAt(Instant.now());
            friendRequestRepository.save(request);
            Friendship existing = friendshipRepository.findByUserId1AndUserId2(pair.userId1(), pair.userId2())
                .orElseThrow(() -> new NotFoundException("Friendship not found"));

            NotificationEvent event = NotificationEvent.builder()
                .type("FRIEND_ACCEPT")
                .actorId(userId)
                .receiverId(request.getRequesterId())
                .targetId(existing.getId().toString())
                .message("accepted your friend request.")
                .createdAt(Instant.now())
                .build();
            notificationProducer.sendNotification(event);

            return toFriendResponse(existing, userId);
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        request.setRespondedAt(Instant.now());
        friendRequestRepository.save(request);

        Friendship friendship = Friendship.builder()
            .userId1(pair.userId1())
            .userId2(pair.userId2())
            .build();

        Friendship savedFriendship = friendshipRepository.save(friendship);

        NotificationEvent event = NotificationEvent.builder()
            .type("FRIEND_ACCEPT")
            .actorId(userId)
            .receiverId(request.getRequesterId())
            .targetId(savedFriendship.getId().toString())
            .message("accepted your friend request.")
            .createdAt(Instant.now())
            .build();
        notificationProducer.sendNotification(event);

        return toFriendResponse(savedFriendship, userId);
    }

    @Transactional
    public FriendRequestResponse declineRequest(UUID userId, UUID requestId) {
        FriendRequest request = friendRequestRepository
            .findByIdAndReceiverIdAndStatus(requestId, userId, FriendRequestStatus.PENDING)
            .orElseThrow(() -> new NotFoundException("Pending friend request not found"));

        request.setStatus(FriendRequestStatus.DECLINED);
        request.setRespondedAt(Instant.now());
        return toResponse(friendRequestRepository.save(request));
    }

    @Transactional
    public FriendRequestResponse cancelRequest(UUID userId, UUID requestId) {
        FriendRequest request = friendRequestRepository
            .findByIdAndRequesterIdAndStatus(requestId, userId, FriendRequestStatus.PENDING)
            .orElseThrow(() -> new NotFoundException("Pending outgoing friend request not found"));

        request.setStatus(FriendRequestStatus.CANCELLED);
        request.setRespondedAt(Instant.now());
        return toResponse(friendRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<FriendResponse> listFriends(UUID userId) {
        List<Friendship> friendships = friendshipRepository.findByUserId1OrUserId2OrderByCreatedAtDesc(userId, userId);
        List<UUID> friendIds = friendships.stream()
            .map(f -> f.getUserId1().equals(userId) ? f.getUserId2() : f.getUserId1())
            .toList();

        java.util.Map<UUID, com.kirenz.user_service.identity.IdentityUserProfileResponse> profiles = java.util.Map.of();
        if (!friendIds.isEmpty()) {
            try {
                profiles = identityServiceClient.getProfilesByIds(friendIds)
                    .getData()
                    .stream()
                    .collect(java.util.stream.Collectors.toMap(
                        com.kirenz.user_service.identity.IdentityUserProfileResponse::id,
                        java.util.function.Function.identity()
                    ));
            } catch (Exception e) {
                // ignore
            }
        }

        java.util.Map<UUID, com.kirenz.user_service.identity.IdentityUserProfileResponse> finalProfiles = profiles;
        return friendships.stream()
            .map(f -> {
                UUID friendId = f.getUserId1().equals(userId) ? f.getUserId2() : f.getUserId1();
                var profile = finalProfiles.get(friendId);
                return new FriendResponse(
                    f.getId(),
                    friendId,
                    profile != null ? profile.username() : null,
                    profile != null ? profile.displayName() : "Kirenz User",
                    profile != null ? profile.avatarUrl() : null,
                    profile != null ? profile.bio() : null,
                    f.getCreatedAt()
                );
            })
            .toList();
    }

    @Transactional
    public void unfriend(UUID userId, UUID friendId) {
        if (userId.equals(friendId)) {
            throw new BadRequestException("Cannot unfriend yourself");
        }

        UserPair pair = UserPair.of(userId, friendId);
        Friendship friendship = friendshipRepository.findByUserId1AndUserId2(pair.userId1(), pair.userId2())
            .orElseThrow(() -> new NotFoundException("Friendship not found"));

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public FriendStatusResponse status(UUID userId, UUID targetUserId) {
        if (userId.equals(targetUserId)) {
            return new FriendStatusResponse(userId, targetUserId, "SELF");
        }

        if (blockRepository.existsByBlockerIdAndBlockedId(userId, targetUserId)) {
            return new FriendStatusResponse(userId, targetUserId, "BLOCKED");
        }

        if (blockRepository.existsByBlockerIdAndBlockedId(targetUserId, userId)) {
            return new FriendStatusResponse(userId, targetUserId, "BLOCKED_BY_TARGET");
        }

        UserPair pair = UserPair.of(userId, targetUserId);
        if (friendshipRepository.existsByUserId1AndUserId2(pair.userId1(), pair.userId2())) {
            return new FriendStatusResponse(userId, targetUserId, "FRIENDS");
        }

        if (friendRequestRepository.existsByRequesterIdAndReceiverIdAndStatus(userId, targetUserId, FriendRequestStatus.PENDING)) {
            return new FriendStatusResponse(userId, targetUserId, "OUTGOING_REQUEST");
        }

        if (friendRequestRepository.existsByRequesterIdAndReceiverIdAndStatus(targetUserId, userId, FriendRequestStatus.PENDING)) {
            return new FriendStatusResponse(userId, targetUserId, "INCOMING_REQUEST");
        }

        return new FriendStatusResponse(userId, targetUserId, "NONE");
    }

    @Transactional(readOnly = true)
    public List<MutualFriendResponse> mutualFriends(UUID viewerId, UUID targetUserId) {
        if (viewerId.equals(targetUserId)) {
            throw new BadRequestException("Cannot get mutual friends with yourself");
        }

        ensureNotBlocked(viewerId, targetUserId, "Cannot get mutual friends when either user has blocked the other");

        Set<UUID> viewerFriendIds = friendIdsOf(viewerId);
        Set<UUID> targetFriendIds = friendIdsOf(targetUserId);

        List<UUID> mutualFriendIds = viewerFriendIds.stream()
            .filter(targetFriendIds::contains)
            .toList();

        if (mutualFriendIds.isEmpty()) {
            return List.of();
        }

        return identityServiceClient.getProfilesByIds(mutualFriendIds)
            .getData()
            .stream()
            .map(this::toMutualFriendResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendSuggestionResponse> suggestFriends(UUID userId, int limit) {
        Set<UUID> myFriendIds = friendIdsOf(userId);

        if (myFriendIds.isEmpty()) {
            return List.of();
        }

        // Collect all blocked user ids (in both directions)
        Set<UUID> blockedIds = new LinkedHashSet<>();
        blockRepository.findByBlockerIdOrderByCreatedAtDesc(userId)
            .forEach(b -> blockedIds.add(b.getBlockedId()));

        // Collect all pending request user ids (outgoing and incoming)
        Set<UUID> pendingIds = new LinkedHashSet<>();
        friendRequestRepository
            .findByRequesterIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
            .forEach(r -> pendingIds.add(r.getReceiverId()));
        friendRequestRepository
            .findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
            .forEach(r -> pendingIds.add(r.getRequesterId()));

        // For each friend, get their friends -> count how many times a candidate appears
        Map<UUID, Integer> candidateMutualCount = new HashMap<>();
        for (UUID friendId : myFriendIds) {
            Set<UUID> friendOfFriendIds = friendIdsOf(friendId);
            for (UUID fofId : friendOfFriendIds) {
                // Exclude self, existing friends, blocked users, pending requests
                if (fofId.equals(userId) || myFriendIds.contains(fofId)
                    || blockedIds.contains(fofId) || pendingIds.contains(fofId)) {
                    continue;
                }
                candidateMutualCount.merge(fofId, 1, Integer::sum);
            }
        }

        if (candidateMutualCount.isEmpty()) {
            return List.of();
        }

        // Sort candidates by mutual friend count (descending) and take top N
        List<UUID> topCandidateIds = candidateMutualCount.entrySet().stream()
            .sorted(Map.Entry.<UUID, Integer>comparingByValue(Comparator.reverseOrder()))
            .limit(limit)
            .map(Map.Entry::getKey)
            .toList();

        // Fetch profiles from identity-service
        Map<UUID, IdentityUserProfileResponse> profiles;
        try {
            profiles = identityServiceClient.getProfilesByIds(topCandidateIds)
                .getData()
                .stream()
                .collect(Collectors.toMap(
                    IdentityUserProfileResponse::id,
                    java.util.function.Function.identity()
                ));
        } catch (Exception e) {
            profiles = Map.of();
        }

        Map<UUID, IdentityUserProfileResponse> finalProfiles = profiles;
        return topCandidateIds.stream()
            .map(candidateId -> {
                var profile = finalProfiles.get(candidateId);
                return new FriendSuggestionResponse(
                    candidateId,
                    profile != null ? profile.username() : null,
                    profile != null ? profile.displayName() : "Kirenz User",
                    profile != null ? profile.avatarUrl() : null,
                    profile != null ? profile.bio() : null,
                    candidateMutualCount.getOrDefault(candidateId, 0)
                );
            })
            .toList();
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        return new FriendRequestResponse(
            request.getId(),
            request.getRequesterId(),
            request.getReceiverId(),
            request.getStatus(),
            request.getCreatedAt(),
            request.getUpdatedAt(),
            request.getRespondedAt()
        );
    }

    private FriendRequestResponse toEnrichedResponse(FriendRequest request, IdentityUserProfileResponse profile) {
        return new FriendRequestResponse(
            request.getId(),
            request.getRequesterId(),
            request.getReceiverId(),
            request.getStatus(),
            request.getCreatedAt(),
            request.getUpdatedAt(),
            request.getRespondedAt(),
            profile != null ? profile.username() : null,
            profile != null ? profile.displayName() : "Kirenz User",
            profile != null ? profile.avatarUrl() : null,
            profile != null ? profile.bio() : null
        );
    }

    private Map<UUID, IdentityUserProfileResponse> fetchProfilesMap(List<UUID> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        try {
            return identityServiceClient.getProfilesByIds(userIds)
                .getData()
                .stream()
                .collect(Collectors.toMap(
                    IdentityUserProfileResponse::id,
                    java.util.function.Function.identity()
                ));
        } catch (Exception e) {
            return Map.of();
        }
    }

    private FriendResponse toFriendResponse(Friendship friendship, UUID currentUserId) {
        UUID friendId = friendship.getUserId1().equals(currentUserId)
            ? friendship.getUserId2()
            : friendship.getUserId1();

        String username = null;
        String displayName = "Kirenz User";
        String avatarUrl = null;
        String bio = null;

        try {
            var response = identityServiceClient.getProfilesByIds(List.of(friendId));
            if (response != null && response.getData() != null && !response.getData().isEmpty()) {
                var profile = response.getData().get(0);
                username = profile.username();
                displayName = profile.displayName();
                avatarUrl = profile.avatarUrl();
                bio = profile.bio();
            }
        } catch (Exception e) {
            // ignore
        }

        return new FriendResponse(
            friendship.getId(),
            friendId,
            username,
            displayName,
            avatarUrl,
            bio,
            friendship.getCreatedAt()
        );
    }

    private Set<UUID> friendIdsOf(UUID userId) {
        List<Friendship> friendships = friendshipRepository.findByUserId1OrUserId2OrderByCreatedAtDesc(userId, userId);
        Set<UUID> friendIds = new LinkedHashSet<>();

        for (Friendship friendship : friendships) {
            UUID friendId = friendship.getUserId1().equals(userId)
                ? friendship.getUserId2()
                : friendship.getUserId1();
            friendIds.add(friendId);
        }

        return friendIds;
    }

    private void ensureNotBlocked(UUID firstUserId, UUID secondUserId, String message) {
        if (blockRepository.existsByBlockerIdAndBlockedId(firstUserId, secondUserId)
            || blockRepository.existsByBlockerIdAndBlockedId(secondUserId, firstUserId)) {
            throw new ForbiddenException(message);
        }
    }

    private MutualFriendResponse toMutualFriendResponse(IdentityUserProfileResponse profile) {
        return new MutualFriendResponse(
            profile.id(),
            profile.username(),
            profile.displayName(),
            profile.avatarUrl(),
            profile.bio()
        );
    }

    private record UserPair(UUID userId1, UUID userId2) {

        private static UserPair of(UUID first, UUID second) {
            return first.compareTo(second) < 0
                ? new UserPair(first, second)
                : new UserPair(second, first);
        }
    }
}
