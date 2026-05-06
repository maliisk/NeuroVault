package com.neurovault.query_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "processed_data")
@Getter
public class ProcessedData {

    @Id
    private Long id;
    private String originalDataId;
    private String userId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "processed_data_keywords", joinColumns = @JoinColumn(name = "processed_data_id"))
    @Column(name = "keywords")
    private List<String> keywords;

    private LocalDateTime processedAt;

    @Column(columnDefinition = "TEXT")
    private String originalContent;
}