package com.example.admin_service.audit;

import com.example.admin_service.audit.dto.AdminActionResponse;
import com.example.admin_service.audit.dto.UserModerationDetailResponse;
import com.example.admin_service.common.exception.NotFoundException;
import com.example.admin_service.user.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminActionService {

    private final AdminActionRepository adminActionRepository;

    @Transactional
    public AdminActionResponse record(
        UUID adminId,
        AdminActionType actionType,
        AdminTargetType targetType,
        String targetId,
        String reason,
        String note
    ) {
        return record(adminId, actionType, targetType, targetId, reason, note, null);
    }

    @Transactional
    public AdminActionResponse record(
        UUID adminId, AdminActionType actionType, AdminTargetType targetType, String targetId,
        String reason, String note, String evidenceUrl
    ) {
        AdminAction action = AdminAction.builder()
            .adminId(adminId)
            .actionType(actionType)
            .targetType(targetType)
            .targetId(targetId)
            .reason(reason)
            .note(note)
            .evidenceUrl(evidenceUrl)
            .build();
        return toResponse(adminActionRepository.save(action));
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminActionResponse> search(
        UUID adminId,
        AdminTargetType targetType,
        String targetId,
        int page,
        int size
    ) {
        String normalizedTargetId = targetId == null || targetId.isBlank() ? null : targetId.trim();
        PageRequest pageable = PageRequest.of(
            Math.max(page, 0),
            Math.max(1, Math.min(size, 100)),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
        var result = adminActionRepository.search(adminId, targetType, normalizedTargetId, pageable)
            .map(this::toResponse);
        return new PageResponse<>(
            result.getContent(),
            result.getNumber(),
            result.getSize(),
            result.getTotalElements(),
            result.getTotalPages()
        );
    }

    @Transactional
    public void delete(UUID actionId) {
        adminActionRepository.deleteById(actionId);
    }

    @Transactional(readOnly = true)
    public UserModerationDetailResponse getForTargetUser(UUID actionId, UUID userId) {
        AdminAction action = adminActionRepository.findById(actionId)
            .filter(item -> item.getTargetType() == AdminTargetType.USER && item.getTargetId().equals(userId.toString()))
            .orElseThrow(() -> new NotFoundException("Moderation action not found"));
        return new UserModerationDetailResponse(action.getId(), action.getActionType(), action.getReason(),
            action.getEvidenceUrl(), action.getCreatedAt());
    }

    private AdminActionResponse toResponse(AdminAction action) {
        return new AdminActionResponse(
            action.getId(),
            action.getAdminId(),
            action.getActionType(),
            action.getTargetType(),
            action.getTargetId(),
            action.getReason(),
            action.getNote(),
            action.getEvidenceUrl(),
            action.getCreatedAt()
        );
    }
}
