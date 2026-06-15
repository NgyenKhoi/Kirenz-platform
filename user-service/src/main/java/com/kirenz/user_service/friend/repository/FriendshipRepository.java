package com.kirenz.user_service.friend.repository;

import com.kirenz.user_service.friend.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    boolean existsByUserId1AndUserId2(UUID userId1, UUID userId2);

    Optional<Friendship> findByUserId1AndUserId2(UUID userId1, UUID userId2);

    List<Friendship> findByUserId1OrUserId2OrderByCreatedAtDesc(UUID userId1, UUID userId2);
}
