package com.neurovault.query_service.controller;

import com.neurovault.query_service.entity.ProcessedData;
import com.neurovault.query_service.repository.ProcessedDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/query")
@RequiredArgsConstructor
public class QueryController {

    private final ProcessedDataRepository repository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProcessedData>> getUserData(@PathVariable String userId) {
        List<ProcessedData> data = repository.findByUserId(userId);

        return ResponseEntity.ok(data);
    }
}