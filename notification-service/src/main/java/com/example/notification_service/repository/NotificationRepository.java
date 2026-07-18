package com.example.notification_service.repository;

import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByReceiverIdAndTypeNotOrderByCreatedAtDesc(UUID receiverId, NotificationType excludedType);

    long countByReceiverIdAndIsReadFalseAndTypeNot(UUID receiverId, NotificationType excludedType);

    boolean existsByReceiverIdAndActorIdAndTypeAndCreatedAtAfter(UUID receiverId, UUID actorId, com.example.notification_service.model.NotificationType type, java.time.Instant after);

    boolean existsByReceiverIdAndTypeAndTargetId(UUID receiverId, NotificationType type, String targetId);

    Optional<Notification> findByIdAndReceiverId(UUID id, UUID receiverId);

    List<Notification> findByReceiverIdAndIsReadFalseAndTypeNot(UUID receiverId, NotificationType excludedType);
}
