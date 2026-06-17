package com.kirenz.user_service.block;

import com.kirenz.user_service.block.dto.BlockResponse;
import com.kirenz.user_service.block.dto.BlockStatusResponse;
import com.kirenz.user_service.block.model.Block;
import com.kirenz.user_service.block.repository.BlockRepository;
import com.kirenz.user_service.common.exception.BadRequestException;
import com.kirenz.user_service.common.exception.ConflictException;
import com.kirenz.user_service.common.exception.NotFoundException;
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
public class BlockService {

    private final BlockRepository blockRepository;
    private final FriendshipRepository friendshipRepository;
    private final FriendRequestRepository friendRequestRepository;

    @Transactional
    public BlockResponse blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("Cannot block yourself");
        }

        if (blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            throw new ConflictException("User is already blocked");
        }

        removeFriendship(blockerId, blockedId);
        closePendingFriendRequests(blockerId, blockedId);

        Block block = Block.builder()
            .blockerId(blockerId)
            .blockedId(blockedId)
            .build();

        return toResponse(blockRepository.save(block));
    }

    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedId) {
        Block block = blockRepository.findByBlockerIdAndBlockedId(blockerId, blockedId)
            .orElseThrow(() -> new NotFoundException("Blocked user not found"));

        blockRepository.delete(block);
    }

    @Transactional(readOnly = true)
    public List<BlockResponse> listBlockedUsers(UUID blockerId) {
        return blockRepository.findByBlockerIdOrderByCreatedAtDesc(blockerId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public BlockStatusResponse status(UUID viewerId, UUID targetUserId) {
        if (viewerId.equals(targetUserId)) {
            return new BlockStatusResponse(viewerId, targetUserId, false, false);
        }

        return new BlockStatusResponse(
            viewerId,
            targetUserId,
            blockRepository.existsByBlockerIdAndBlockedId(viewerId, targetUserId),
            blockRepository.existsByBlockerIdAndBlockedId(targetUserId, viewerId)
        );
    }

    private void removeFriendship(UUID blockerId, UUID blockedId) {
        UserPair pair = UserPair.of(blockerId, blockedId);
        friendshipRepository.findByUserId1AndUserId2(pair.userId1(), pair.userId2())
            .ifPresent(friendshipRepository::delete);
    }

    private void closePendingFriendRequests(UUID blockerId, UUID blockedId) {
        friendRequestRepository
            .findByRequesterIdAndReceiverIdAndStatus(blockerId, blockedId, FriendRequestStatus.PENDING)
            .ifPresent(request -> closeRequest(request, FriendRequestStatus.CANCELLED));

        friendRequestRepository
            .findByRequesterIdAndReceiverIdAndStatus(blockedId, blockerId, FriendRequestStatus.PENDING)
            .ifPresent(request -> closeRequest(request, FriendRequestStatus.DECLINED));
    }

    private void closeRequest(FriendRequest request, FriendRequestStatus status) {
        request.setStatus(status);
        request.setRespondedAt(Instant.now());
        friendRequestRepository.save(request);
    }

    private BlockResponse toResponse(Block block) {
        return new BlockResponse(block.getId(), block.getBlockedId(), block.getCreatedAt());
    }

    private record UserPair(UUID userId1, UUID userId2) {

        private static UserPair of(UUID first, UUID second) {
            return first.compareTo(second) < 0
                ? new UserPair(first, second)
                : new UserPair(second, first);
        }
    }
}
