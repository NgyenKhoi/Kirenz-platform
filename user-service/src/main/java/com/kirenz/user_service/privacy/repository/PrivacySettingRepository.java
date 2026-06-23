package com.kirenz.user_service.privacy.repository;

import com.kirenz.user_service.privacy.model.PrivacySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PrivacySettingRepository extends JpaRepository<PrivacySetting, UUID> {
    Optional<PrivacySetting> findByUserId(UUID userId);
}
