package com.example.social_service.bookmark.model;

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

@Document(collection = "bookmarks")
@CompoundIndex(name = "user_post_unique_idx", def = "{'userId': 1, 'postId': 1}", unique = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    private String id;

    @Indexed
    private UUID userId;

    private String postId;

    private Instant createdAt;
}
