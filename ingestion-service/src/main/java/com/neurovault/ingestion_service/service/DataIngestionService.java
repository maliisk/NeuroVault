package com.neurovault.ingestion_service.service;

import com.neurovault.ingestion_service.document.RawData;
import com.neurovault.ingestion_service.repository.RawDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataIngestionService {

    private final RawDataRepository rawDataRepository;

    private final KafkaTemplate<String, RawData> kafkaTemplate;

    private static final String TOPIC_NAME = "raw-data-events";

    public Mono<RawData> processIncomingData(String userId, String content, String source) {

        RawData newData = RawData.builder()
                .userId(userId)
                .content(content)
                .source(source)
                .timestamp(LocalDateTime.now())
                .build();

        return rawDataRepository.save(newData)
                .doOnSuccess(savedData -> {
                    kafkaTemplate.send(TOPIC_NAME, savedData.getId(), savedData);
                    log.info("Veri MongoDB'ye yazıldı ve Kafka'ya fırlatıldı! Veri ID: {}", savedData.getId());
                })
                .doOnError(error -> {
                    log.error("Veri işlenirken devasa bir hata oluştu: {}", error.getMessage());
                });
    }
}