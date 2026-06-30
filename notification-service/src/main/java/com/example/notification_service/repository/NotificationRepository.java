package com.example.notification_service.repository;

import com.example.notification_service.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByReceiverIdOrderByCreatedAtDesc(UUID receiverId);

    long countByReceiverIdAndIsReadFalse(UUID receiverId);

    boolean existsByReceiverIdAndActorIdAndTypeAndCreatedAtAfter(UUID receiverId, UUID actorId, com.example.notification_service.model.NotificationType type, java.time.Instant after);

    Optional<Notification> findByIdAndReceiverId(UUID id, UUID receiverId);

    List<Notification> findByReceiverIdAndIsReadFalse(UUID receiverId);
}
