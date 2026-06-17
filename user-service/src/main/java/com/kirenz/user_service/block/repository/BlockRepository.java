package com.kirenz.user_service.block.repository;

import com.kirenz.user_service.block.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, UUID> {

    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    List<Block> findByBlockerIdOrderByCreatedAtDesc(UUID blockerId);

    Optional<Block> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
}
