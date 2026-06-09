package com.kirenz.identity_service.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "privacy_settings")
public class PrivacySetting {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PUBLIC'")
    @Column(name = "profile_visibility", nullable = false, length = 20)
    private String profileVisibility;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PUBLIC'")
    @Column(name = "post_visibility_default", nullable = false, length = 20)
    private String postVisibilityDefault;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'EVERYONE'")
    @Column(name = "allow_mentions", nullable = false, length = 20)
    private String allowMentions;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "show_last_seen", nullable = false)
    private Boolean showLastSeen = false;

}