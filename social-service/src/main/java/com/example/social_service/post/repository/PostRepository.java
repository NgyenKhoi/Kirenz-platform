package com.example.social_service.post.repository;

import com.example.social_service.post.model.Post;
import com.example.social_service.post.model.PostStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends MongoRepository<Post, String> {

    List<Post> findByStatusOrderByCreatedAtDesc(PostStatus status);

    Optional<Post> findByIdAndStatus(String id, PostStatus status);
}
