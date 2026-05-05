package com.neurovault.ingestion_service.controller;

import com.neurovault.ingestion_service.dto.IngestionRequest;
import com.neurovault.ingestion_service.service.DataIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class IngestionController {

    private final DataIngestionService ingestionService;

    @PostMapping("/ingest")
    public Mono<ResponseEntity<String>> ingestData(@RequestBody IngestionRequest request) {

        return ReactiveSecurityContextHolder.getContext()
                .map(securityContext -> securityContext.getAuthentication().getName())
                .flatMap(userEmail ->
                        ingestionService.processIncomingData(userEmail, request.getContent(), request.getSource())
                )
                .map(savedData -> ResponseEntity.ok("Veri başarıyla kaydedildi ve Kafka'ya eklendi! ID: " + savedData.getId()));
    }
}