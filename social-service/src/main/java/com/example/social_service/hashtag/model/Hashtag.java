package com.example.social_service.hashtag.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "hashtags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hashtag {

    @Id
    private String id;

    @Indexed(unique = true)
    private String tag;

    @Builder.Default
    private Integer postCount = 0;

    @Builder.Default
    private Double trendingScore = 0.0;

    private Instant lastUsedAt;

    private Instant createdAt;

    private Instant updatedAt;
}
