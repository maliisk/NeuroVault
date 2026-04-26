package com.neurovault.ingestion_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IngestionRequest {
    private String userId;
    private String content;
    private String source;
}