package com.neurovault.cognitive_engine.service;

import com.neurovault.cognitive_engine.entity.ProcessedData;
import com.neurovault.cognitive_engine.repository.ProcessedDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final ProcessedDataRepository processedDataRepository;
    private final CognitiveAiService aiService;

    @KafkaListener(topics = "raw-data-events", groupId = "cognitive-group")
    public void consumeRawData(ConsumerRecord<String, Map<String, Object>> record) {

        try {
            Map<String, Object> data = record.value();
            String realUserId = (String) data.get("userId");
            String contentToAnalyze = (String) data.get("content");

            log.info("Kafka'dan veri yakalandı, AI motoru çalıştırılıyor...");

            AnalysisResult result = aiService.analyzeText(contentToAnalyze);

            ProcessedData processed = ProcessedData.builder()
                    .originalDataId("KAFKA_MSG")
                    .userId(realUserId != null ? realUserId : "UNKNOWN_USER")
                    .summary(result.summary())
                    .keywords(result.keywords())
                    .processedAt(LocalDateTime.now())
                    .build();

            processedDataRepository.save(processed);
            log.info("Yapay zeka analizi PostgreSQL'e başarıyla kaydedildi!");

        } catch (Exception e) {
            log.error("Veri işlenirken devasa bir hata oluştu: {}", e.getMessage());
        }
    }
}