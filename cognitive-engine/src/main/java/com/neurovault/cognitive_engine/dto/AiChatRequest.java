package com.neurovault.cognitive_engine.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class AiChatRequest {
    private String question;
    private List<ContextDataDTO> contextData;
}