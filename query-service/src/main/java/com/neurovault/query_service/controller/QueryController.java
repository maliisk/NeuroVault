package com.neurovault.query_service.controller;

import com.neurovault.query_service.dto.ChatRequest;
import com.neurovault.query_service.dto.ChatResponse;
import com.neurovault.query_service.entity.ProcessedData;
import com.neurovault.query_service.repository.ProcessedDataRepository;
import com.neurovault.query_service.service.QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/v1/query")
@RequiredArgsConstructor
public class QueryController {

    private final ProcessedDataRepository repository;
    private final QueryService queryService;
    private final RestTemplate restTemplate;

    @GetMapping("/my-brain")
    public ResponseEntity<List<ProcessedData>> getMyBrain() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ProcessedData> data = repository.findByUserId(userEmail);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMemory(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        queryService.deleteMemory(id, userEmail);
        return ResponseEntity.ok("Hafıza başarıyla silindi ve nöral bağlar koparıldı.");
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askToBrain(@RequestBody ChatRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ProcessedData> myBrain = repository.findByUserId(userEmail);

        if (myBrain.isEmpty()) {
            return ResponseEntity.ok(new ChatResponse("Henüz dijital beyninizde hiç veri yok. Bana bir şeyler öğretin!"));
        }

        request.setContextData(myBrain);
        
        String cognitiveEngineUrl = "http://cognitive-engine/api/v1/ai/generate-answer";

        try {
            ChatResponse response = restTemplate.postForObject(cognitiveEngineUrl, request, ChatResponse.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new ChatResponse("Bilişsel motora ulaşılamadı. Lütfen nöral bağlantıları kontrol edin. Detay: " + e.getMessage()));
        }
    }
}