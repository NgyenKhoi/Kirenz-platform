package com.example.chat_service.message.dto;

import com.example.chat_service.message.model.Attachment;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotBlank
    private String conversationId;

    @NotBlank
    private String content;

    private List<Attachment> attachments;
}
