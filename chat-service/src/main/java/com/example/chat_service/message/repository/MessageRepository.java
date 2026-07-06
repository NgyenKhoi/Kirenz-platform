package com.example.chat_service.message.repository;

import com.example.chat_service.message.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    Page<Message> findByConversationIdAndStatusOrderBySentAtDesc(
        String conversationId, String status, Pageable pageable);

    @Query(
        value = "{ 'conversationId': ?0, 'status': 'ACTIVE', 'statusList': { '$elemMatch': { 'userId': ?1, 'status': { '$ne': 'READ' } } } }",
        count = true
    )
    long countUnreadMessages(String conversationId, UUID userId);
}
