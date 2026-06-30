package com.example.notification_service.scheduler;

import com.example.notification_service.client.FriendResponse;
import com.example.notification_service.client.IdentityServiceClient;
import com.example.notification_service.client.IdentityUserProfileResponse;
import com.example.notification_service.client.UserServiceClient;
import com.example.notification_service.dto.ApiResponse;
import com.example.notification_service.model.Notification;
import com.example.notification_service.model.NotificationType;
import com.example.notification_service.repository.NotificationRepository;
import com.example.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BirthdayNotificationScheduler {

    private final IdentityServiceClient identityServiceClient;
    private final UserServiceClient userServiceClient;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    // Run daily at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void scheduleBirthdayCheck() {
        log.info("Running scheduled birthday check...");
        checkBirthdays();
    }

    // Run also on application startup to ensure birth notifications are sent for testing/demo
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Application started. Running startup birthday check...");
        // Run in a separate thread so as not to block main startup thread
        new Thread(this::checkBirthdays).start();
    }

    private void checkBirthdays() {
        try {
            ApiResponse<List<IdentityUserProfileResponse>> birthdaysResponse = identityServiceClient.getBirthdaysToday();
            if (birthdaysResponse == null || birthdaysResponse.getData() == null || birthdaysResponse.getData().isEmpty()) {
                log.info("No birthdays found for today.");
                return;
            }

            List<IdentityUserProfileResponse> birthdayUsers = birthdaysResponse.getData();
            log.info("Found {} user(s) with birthday today.", birthdayUsers.size());

            Instant startOfToday = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();

            for (IdentityUserProfileResponse user : birthdayUsers) {
                UUID birthdayUserId = user.id();
                String displayName = user.displayName() != null ? user.displayName() : user.username();

                // Fetch friends list of the birthday user
                ApiResponse<List<FriendResponse>> friendsResponse = userServiceClient.listUserFriends(birthdayUserId);
                if (friendsResponse == null || friendsResponse.getData() == null || friendsResponse.getData().isEmpty()) {
                    log.info("Birthday user {} has no friends to notify.", displayName);
                    continue;
                }

                List<FriendResponse> friends = friendsResponse.getData();
                log.info("Notifying {} friend(s) about user {}'s birthday.", friends.size(), displayName);

                for (FriendResponse friend : friends) {
                    UUID friendId = friend.friendId();

                    // Avoid duplicate birthday notifications for the same day
                    boolean exists = notificationRepository.existsByReceiverIdAndActorIdAndTypeAndCreatedAtAfter(
                        friendId, birthdayUserId, NotificationType.BIRTHDAY, startOfToday
                    );

                    if (!exists) {
                        Notification notification = Notification.builder()
                            .receiverId(friendId)
                            .actorId(birthdayUserId)
                            .type(NotificationType.BIRTHDAY)
                            .targetId(birthdayUserId.toString())
                            .message("Today is " + displayName + "'s birthday. Go send them some wishes!")
                            .createdAt(Instant.now())
                            .build();

                        notificationService.saveAndPushNotification(notification);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error occurred during birthday notification processing: {}", e.getMessage(), e);
        }
    }
}
