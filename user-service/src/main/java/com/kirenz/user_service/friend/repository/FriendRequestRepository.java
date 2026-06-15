package com.kirenz.user_service.friend.repository;

import com.kirenz.user_service.friend.model.FriendRequest;
import com.kirenz.user_service.friend.model.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, UUID> {

    boolean existsByRequesterIdAndReceiverIdAndStatus(UUID requesterId, UUID receiverId, FriendRequestStatus status);

    Optional<FriendRequest> findByIdAndReceiverIdAndStatus(UUID id, UUID receiverId, FriendRequestStatus status);

    Optional<FriendRequest> findByIdAndRequesterIdAndStatus(UUID id, UUID requesterId, FriendRequestStatus status);

    List<FriendRequest> findByReceiverIdAndStatusOrderByCreatedAtDesc(UUID receiverId, FriendRequestStatus status);

    List<FriendRequest> findByRequesterIdAndStatusOrderByCreatedAtDesc(UUID requesterId, FriendRequestStatus status);
}
