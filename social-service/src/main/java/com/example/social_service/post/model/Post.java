package com.example.social_service.post.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "posts")
@CompoundIndex(name = "status_created_at_idx", def = "{'status': 1, 'createdAt': -1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    private String id;

    @Indexed(unique = true)
    private String slug;

    @Indexed
    private UUID userId;

    private String content;

    @Builder.Default
    private PostPrivacy privacy = PostPrivacy.PUBLIC;

    @Indexed
    private String originalPostId;

    @Builder.Default
    private List<PostMedia> media = new ArrayList<>();

    @Builder.Default
    private List<UUID> taggedUserIds = new ArrayList<>();

    @Builder.Default
    private Integer reactionsCount = 0;

    @Builder.Default
    private Integer commentsCount = 0;

    @Builder.Default
    private PostStatus status = PostStatus.ACTIVE;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant deletedAt;
}
