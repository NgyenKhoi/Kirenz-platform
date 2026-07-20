package com.example.social_service.post.dto;

import java.util.List;

public record CursorPage<T>(List<T> items, String nextCursor, boolean hasMore) {
}
