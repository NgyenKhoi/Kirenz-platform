package com.example.social_service.analytics;

import com.example.social_service.analytics.dto.ContentGrowthPointResponse;
import com.example.social_service.analytics.dto.SocialMetricsResponse;
import com.example.social_service.comment.model.CommentStatus;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.post.model.PostStatus;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SocialAnalyticsService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;

    @Value("${admin.metrics-zone:Asia/Bangkok}")
    private String metricsZone;

    public SocialMetricsResponse getMetrics() {
        return new SocialMetricsResponse(
            postRepository.countByStatus(PostStatus.ACTIVE),
            commentRepository.countByStatus(CommentStatus.ACTIVE),
            reactionRepository.count()
        );
    }

    public List<ContentGrowthPointResponse> getGrowth(LocalDate from, LocalDate to, String granularity) {
        ZoneId zoneId = ZoneId.of(metricsZone);
        LocalDate normalizedFrom = from == null ? LocalDate.now(zoneId).minusDays(29) : from;
        LocalDate normalizedTo = to == null ? LocalDate.now(zoneId) : to;
        if (normalizedTo.isBefore(normalizedFrom) || normalizedFrom.plusYears(2).isBefore(normalizedTo)) {
            throw new IllegalArgumentException("Growth range must be ordered and no longer than two years");
        }
        boolean monthly = "MONTH".equalsIgnoreCase(granularity);
        Map<String, long[]> buckets = new LinkedHashMap<>();
        LocalDate cursor = monthly ? normalizedFrom.withDayOfMonth(1) : normalizedFrom;
        LocalDate last = monthly ? normalizedTo.withDayOfMonth(1) : normalizedTo;
        while (!cursor.isAfter(last)) {
            buckets.put(key(cursor, monthly), new long[3]);
            cursor = monthly ? cursor.plusMonths(1) : cursor.plusDays(1);
        }

        Instant start = normalizedFrom.atStartOfDay(zoneId).toInstant();
        Instant endExclusive = normalizedTo.plusDays(1).atStartOfDay(zoneId).toInstant();
        postRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, endExclusive)
            .forEach(post -> increment(buckets, post.getCreatedAt(), zoneId, monthly, 0));
        commentRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, endExclusive)
            .forEach(comment -> increment(buckets, comment.getCreatedAt(), zoneId, monthly, 1));
        reactionRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(start, endExclusive)
            .forEach(reaction -> increment(buckets, reaction.getCreatedAt(), zoneId, monthly, 2));

        return buckets.entrySet().stream()
            .map(entry -> new ContentGrowthPointResponse(
                entry.getKey(), entry.getValue()[0], entry.getValue()[1], entry.getValue()[2]))
            .toList();
    }

    private void increment(Map<String, long[]> buckets, Instant createdAt, ZoneId zoneId, boolean monthly, int index) {
        if (createdAt == null) {
            return;
        }
        long[] values = buckets.get(key(createdAt.atZone(zoneId).toLocalDate(), monthly));
        if (values != null) {
            values[index]++;
        }
    }

    private String key(LocalDate date, boolean monthly) {
        return monthly ? date.toString().substring(0, 7) : date.toString();
    }
}
