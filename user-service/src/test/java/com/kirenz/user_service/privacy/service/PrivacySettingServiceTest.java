package com.kirenz.user_service.privacy.service;

import com.kirenz.user_service.auth.CurrentUser;
import com.kirenz.user_service.friend.repository.FriendshipRepository;
import com.kirenz.user_service.privacy.model.PrivacySetting;
import com.kirenz.user_service.privacy.repository.PrivacySettingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrivacySettingServiceTest {

    @Mock PrivacySettingRepository privacySettingRepository;
    @Mock FriendshipRepository friendshipRepository;
    @Mock CurrentUser currentUser;
    @InjectMocks PrivacySettingService privacySettingService;

    @Test
    void blocksDirectMessagesFromStrangersWhenReceiverDisablesThem() {
        UUID senderId = UUID.randomUUID();
        UUID receiverId = UUID.randomUUID();
        when(privacySettingRepository.findByUserId(receiverId))
            .thenReturn(Optional.of(PrivacySetting.builder().userId(receiverId).allowDirectMessages(false).build()));
        UUID first = senderId.compareTo(receiverId) < 0 ? senderId : receiverId;
        UUID second = senderId.compareTo(receiverId) < 0 ? receiverId : senderId;
        when(friendshipRepository.existsByUserId1AndUserId2(first, second)).thenReturn(false);

        assertThat(privacySettingService.canSendDirectMessage(senderId, receiverId)).isFalse();
    }

    @Test
    void stillAllowsFriendsWhenReceiverDisablesMessagesFromStrangers() {
        UUID senderId = UUID.randomUUID();
        UUID receiverId = UUID.randomUUID();
        when(privacySettingRepository.findByUserId(receiverId))
            .thenReturn(Optional.of(PrivacySetting.builder().userId(receiverId).allowDirectMessages(false).build()));
        UUID first = senderId.compareTo(receiverId) < 0 ? senderId : receiverId;
        UUID second = senderId.compareTo(receiverId) < 0 ? receiverId : senderId;
        when(friendshipRepository.existsByUserId1AndUserId2(first, second)).thenReturn(true);

        assertThat(privacySettingService.canSendDirectMessage(senderId, receiverId)).isTrue();
    }
}
