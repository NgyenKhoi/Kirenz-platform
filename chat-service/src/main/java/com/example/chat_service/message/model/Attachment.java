package com.example.chat_service.message.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    private String type;           // e.g., IMAGE, VIDEO, FILE
    private String url;
    private String cloudinaryPublicId;
    private Map<String, Object> metadata; // e.g., width, height, size
}
