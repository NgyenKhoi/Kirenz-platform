package com.example.social_service.analytics;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.repository.CommentRepository;
import com.example.social_service.post.model.Post;
import com.example.social_service.post.repository.PostRepository;
import com.example.social_service.reaction.model.Reaction;
import com.example.social_service.reaction.repository.ReactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SocialAnalyticsServiceTest {

    @Mock PostRepository postRepository;
    @Mock CommentRepository commentRepository;
    @Mock ReactionRepository reactionRepository;
    private SocialAnalyticsService service;

    @BeforeEach
    void setUp() {
        service = new SocialAnalyticsService(postRepository, commentRepository, reactionRepository);
        ReflectionTestUtils.setField(service, "metricsZone", "UTC");
    }

    @Test
    void aggregatesAndFillsDailyBuckets() {
        when(postRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any()))
            .thenReturn(List.of(Post.builder().createdAt(Instant.parse("2026-07-01T10:00:00Z")).build()));
        when(commentRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any()))
            .thenReturn(List.of(Comment.builder().createdAt(Instant.parse("2026-07-03T10:00:00Z")).build()));
        when(reactionRepository.findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(any(), any()))
            .thenReturn(List.of(Reaction.builder().createdAt(Instant.parse("2026-07-03T11:00:00Z")).build()));

        var result = service.getGrowth(
            LocalDate.parse("2026-07-01"), LocalDate.parse("2026-07-03"), "DAY");

        assertThat(result).hasSize(3);
        assertThat(result.get(1).posts()).isZero();
        assertThat(result.get(2).comments()).isEqualTo(1);
        assertThat(result.get(2).reactions()).isEqualTo(1);
    }
}
