package com.example.admin_service.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface AdminActionRepository extends JpaRepository<AdminAction, UUID> {

    @Query("""
        select action from AdminAction action
        where (:adminId is null or action.adminId = :adminId)
          and (:targetType is null or action.targetType = :targetType)
          and (:targetId is null or action.targetId = :targetId)
        """)
    Page<AdminAction> search(
        @Param("adminId") UUID adminId,
        @Param("targetType") AdminTargetType targetType,
        @Param("targetId") String targetId,
        Pageable pageable
    );
}
