package com.example.social_service.comment.model;

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

@Document(collection = "comments")
@CompoundIndex(name = "post_created_at_idx", def = "{'postId': 1, 'createdAt': 1}")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    private String id;

    private String postId;

    @Indexed
    private UUID userId;

    private String parentCommentId;

    private String content;

    @Builder.Default
    private Integer reactionsCount = 0;

    @Builder.Default
    private CommentStatus status = CommentStatus.ACTIVE;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant deletedAt;
}
