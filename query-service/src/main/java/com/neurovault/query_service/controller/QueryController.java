package com.neurovault.query_service.controller;

import com.neurovault.query_service.entity.ProcessedData;
import com.neurovault.query_service.repository.ProcessedDataRepository;
import com.neurovault.query_service.service.QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/query")
@RequiredArgsConstructor
public class QueryController {

    private final ProcessedDataRepository repository;
    private final QueryService queryService; // YENİ: Servisimizi dahil ettik

    @GetMapping("/my-brain")
    public ResponseEntity<List<ProcessedData>> getMyBrain() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ProcessedData> data = repository.findByUserId(userEmail);
        return ResponseEntity.ok(data);
    }

    // YENİ: Hafızadan Silme Endpoint'i
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteMemory(@PathVariable Long id) {
        // Token'dan giriş yapan kişinin emailini alıyoruz
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        // Servise silme işlemini devrediyoruz
        queryService.deleteMemory(id, userEmail);

        return ResponseEntity.ok("Hafıza başarıyla silindi ve nöral bağlar koparıldı.");
    }
}