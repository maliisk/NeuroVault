package com.neurovault.ingestion_service.controller;

import com.neurovault.ingestion_service.dto.IngestionRequest;
import com.neurovault.ingestion_service.service.DataIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class IngestionController {

    private final DataIngestionService ingestionService;

    @PostMapping("/ingest")
    public Mono<ResponseEntity<String>> ingestData(@RequestBody IngestionRequest request) {

        return ingestionService.processIncomingData(request.getUserId(), request.getContent(), request.getSource())
                .map(savedData -> {
                    return ResponseEntity.ok("Veri başarıyla kaydedildi ve analiz kuyruğuna (Kafka) eklendi! ID: " + savedData.getId());
                });
    }
}