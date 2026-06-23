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
}
