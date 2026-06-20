package com.example.social_service.comment.repository;

import com.example.social_service.comment.model.Comment;
import com.example.social_service.comment.model.CommentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByPostIdAndStatusOrderByCreatedAtAsc(String postId, CommentStatus status);

    Optional<Comment> findByIdAndStatus(String id, CommentStatus status);

    Optional<Comment> findByIdAndPostIdAndStatus(String id, String postId, CommentStatus status);

    List<Comment> findByParentCommentIdAndStatus(String parentCommentId, CommentStatus status);
}
