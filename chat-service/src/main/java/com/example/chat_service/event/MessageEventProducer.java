package com.example.chat_service.event;

import com.example.chat_service.conversation.model.Conversation;
import com.example.chat_service.message.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MessageEventProducer {

    private static final String MESSAGE_SENT_TOPIC = "message-sent";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishMessageSent(Message message, Conversation conversation) {
        conversation.getParticipantIds().stream()
            .filter(receiverId -> !receiverId.equals(message.getSenderId()))
            .forEach(receiverId -> {
                MessageSentEvent event = MessageSentEvent.builder()
                    .messageId(message.getId())
                    .conversationId(message.getConversationId())
                    .senderId(message.getSenderId())
                    .receiverId(receiverId)
                    .content(message.getContent())
                    .messageType(message.getType().name())
                    .sentAt(message.getSentAt())
                    .build();

                kafkaTemplate.send(MESSAGE_SENT_TOPIC, receiverId.toString(), event)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish message-sent event for message {} to receiver {}", message.getId(), receiverId, ex);
                        } else {
                            log.debug("Published message-sent event for message {} to receiver {}", message.getId(), receiverId);
                        }
                    });
            });
    }
}
