package com.example.social_service.post.dto;

public record TrendingHashtagResponse(String tag, long postCount, int windowSize) {
}
