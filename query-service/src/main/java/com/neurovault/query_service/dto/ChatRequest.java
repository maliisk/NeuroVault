package com.neurovault.query_service.dto;

import com.neurovault.query_service.entity.ProcessedData;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ChatRequest {
    private String question;
    private List<ProcessedData> contextData;
}