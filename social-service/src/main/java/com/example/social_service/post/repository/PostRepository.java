package com.example.social_service.post.repository;

import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);

    List<Post> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PostStatus status);

    Optional<Post> findByIdAndStatus(String id, PostStatus status);

    long countByStatus(PostStatus status);

    List<Post> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(Instant from, Instant to);
}
