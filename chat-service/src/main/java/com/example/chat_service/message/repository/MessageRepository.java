package com.example.chat_service.message.repository;

import com.example.chat_service.message.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    Page<Message> findByConversationIdAndStatusOrderBySentAtDesc(
        String conversationId, String status, Pageable pageable);

    @org.springframework.data.mongodb.repository.Query("{ 'conversationId': ?0, 'status': 'ACTIVE', 'statusList': { '$elemMatch': { 'userId': ?1, 'status': { '$ne': 'READ' } } } }")
    long countUnreadMessages(String conversationId, java.util.UUID userId);
}
