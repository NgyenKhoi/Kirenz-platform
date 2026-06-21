package com.example.social_service.post.dto;

import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.model.PostPrivacy;
import com.example.social_service.reaction.dto.ReactionSummaryResponse;

import java.time.Instant;
import java.util.List;

public record PostResponse(
    String id,
    String slug,
    AuthorResponse author,
    String content,
    PostPrivacy privacy,
    String originalPostId,
    SharedPostResponse sharedPost,
    List<PostMediaResponse> media,
    Integer reactionsCount,
    ReactionSummaryResponse reactionSummary,
    Integer commentsCount,
    PostStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
