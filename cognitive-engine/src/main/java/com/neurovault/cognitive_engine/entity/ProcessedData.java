package com.neurovault.cognitive_engine.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "processed_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalDataId;
    private String userId;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @ElementCollection
    private List<String> keywords;

    private LocalDateTime processedAt;
}