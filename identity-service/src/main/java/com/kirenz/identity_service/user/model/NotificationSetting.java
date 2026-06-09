package com.kirenz.identity_service.user.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification_settings")
public class NotificationSetting {
    @Id
    @Column(name = "user_id", nullable = false)
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "friend_requests", nullable = false)
    @Builder.Default
    private Boolean friendRequests = true;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "messages", nullable = false)
    @Builder.Default
    private Boolean messages = true;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "comments", nullable = false)
    @Builder.Default
    private Boolean comments = true;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "mentions", nullable = false)
    @Builder.Default
    private Boolean mentions = true;

    @NotNull
    @ColumnDefault("true")
    @Column(name = "reactions", nullable = false)
    @Builder.Default
    private Boolean reactions = true;
}
