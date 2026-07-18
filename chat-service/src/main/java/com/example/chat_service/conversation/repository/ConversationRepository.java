package com.example.chat_service.conversation.repository;

import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.conversation.model.ConversationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    List<Conversation> findByParticipantIdsContainingAndStatusOrderByUpdatedAtDesc(
        UUID userId, String status);

    @Query("{ 'participantIds': { $all: ?0, $size: ?1 }, 'type': ?2, 'status': ?3 }")
    Optional<Conversation> findExactDirectConversation(
        List<UUID> participantIds, int size, ConversationType type, String status);
}
