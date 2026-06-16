package com.example.social_service.reaction.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.UUID;

@Document(collection = "reactions")
@CompoundIndex(name = "user_target_unique_idx", def = "{'userId': 1, 'targetType': 1, 'targetId': 1}", unique = true)
@CompoundIndex(name = "target_created_at_idx", def = "{'targetType': 1, 'targetId': 1, 'createdAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {

    @Id
    private String id;

    @Indexed
    private UUID userId;

    private ReactionTargetType targetType;

    private String targetId;

    private ReactionType type;

    private Instant createdAt;

    private Instant updatedAt;
}
