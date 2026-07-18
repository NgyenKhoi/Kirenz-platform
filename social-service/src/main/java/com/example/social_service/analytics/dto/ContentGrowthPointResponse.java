package com.example.social_service.analytics.dto;

public record ContentGrowthPointResponse(
    String period,
    long posts,
    long comments,
    long reactions
) {
}
