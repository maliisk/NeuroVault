package com.neurovault.cognitive_engine.service;

import com.neurovault.cognitive_engine.entity.ProcessedData;
import com.neurovault.cognitive_engine.repository.ProcessedDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ProcessedDataRepository processedDataRepository;

     @KafkaListener(topics = "raw-data-events", groupId = "cognitive-group")
    public void consumeRawData(Object rawDataMap) {
         log.info("Kafka'dan yeni ham veri yakalandı: {}", rawDataMap);

        try {
            ProcessedData processed = ProcessedData.builder()
                    .originalDataId("KAFKA_MSG")
                    .userId("SYSTEM")
                    .summary("Bu veri asenkron olarak analiz edildi.")
                    .keywords(Arrays.asList("analiz", "kafka", "neurovault"))
                    .processedAt(LocalDateTime.now())
                    .build();

            processedDataRepository.save(processed);
            log.info("Analiz sonucu PostgreSQL'e başarıyla kaydedildi.");

        } catch (Exception e) {
            log.error("Veri işlenirken hata oluştu: {}", e.getMessage());
        }
    }
}