package com.neurovault.ingestion_service.document;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@Document(collection = "raw_data")
public class RawData {

    @Id
    private String id;

    private String userId;
    private String content;
    private String source;
    private LocalDateTime timestamp;
}