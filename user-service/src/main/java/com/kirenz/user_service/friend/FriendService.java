package com.kirenz.user_service.friend;

import com.kirenz.user_service.common.exception.BadRequestException;
import com.kirenz.user_service.common.exception.ConflictException;
import com.kirenz.user_service.common.exception.NotFoundException;
import com.kirenz.user_service.friend.dto.FriendRequestResponse;
import com.kirenz.user_service.friend.dto.FriendResponse;
import com.kirenz.user_service.friend.dto.FriendStatusResponse;
import com.kirenz.user_service.friend.model.FriendRequest;
import com.kirenz.user_service.friend.model.FriendRequestStatus;
import com.kirenz.user_service.friend.model.Friendship;
import com.kirenz.user_service.friend.repository.FriendRequestRepository;
import com.kirenz.user_service.friend.repository.FriendshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;

    @Transactional
    public FriendRequestResponse sendRequest(UUID requesterId, UUID receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new BadRequestException("Cannot send a friend request to yourself");
        }

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

        return toResponse(friendRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> incomingRequests(UUID userId) {
        return friendRequestRepository
            .findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> outgoingRequests(UUID userId) {
        return friendRequestRepository
            .findByRequesterIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public FriendResponse acceptRequest(UUID userId, UUID requestId) {
        FriendRequest request = friendRequestRepository
            .findByIdAndReceiverIdAndStatus(requestId, userId, FriendRequestStatus.PENDING)
            .orElseThrow(() -> new NotFoundException("Pending friend request not found"));

        UserPair pair = UserPair.of(request.getRequesterId(), request.getReceiverId());
        if (friendshipRepository.existsByUserId1AndUserId2(pair.userId1(), pair.userId2())) {
            request.setStatus(FriendRequestStatus.ACCEPTED);
            request.setRespondedAt(Instant.now());
            friendRequestRepository.save(request);
            Friendship existing = friendshipRepository.findByUserId1AndUserId2(pair.userId1(), pair.userId2())
                .orElseThrow(() -> new NotFoundException("Friendship not found"));
            return toFriendResponse(existing, userId);
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        request.setRespondedAt(Instant.now());
        friendRequestRepository.save(request);

        Friendship friendship = Friendship.builder()
            .userId1(pair.userId1())
            .userId2(pair.userId2())
            .build();

        return toFriendResponse(friendshipRepository.save(friendship), userId);
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
        return friendshipRepository.findByUserId1OrUserId2OrderByCreatedAtDesc(userId, userId)
            .stream()
            .map(friendship -> toFriendResponse(friendship, userId))
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

    private FriendResponse toFriendResponse(Friendship friendship, UUID currentUserId) {
        UUID friendId = friendship.getUserId1().equals(currentUserId)
            ? friendship.getUserId2()
            : friendship.getUserId1();
        return new FriendResponse(friendship.getId(), friendId, friendship.getCreatedAt());
    }

    private record UserPair(UUID userId1, UUID userId2) {

        private static UserPair of(UUID first, UUID second) {
            return first.compareTo(second) < 0
                ? new UserPair(first, second)
                : new UserPair(second, first);
        }
    }
}
