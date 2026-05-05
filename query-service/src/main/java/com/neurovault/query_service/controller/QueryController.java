package com.neurovault.query_service.controller;

import com.neurovault.query_service.entity.ProcessedData;
import com.neurovault.query_service.repository.ProcessedDataRepository;
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


    @GetMapping("/my-brain")
    public ResponseEntity<List<ProcessedData>> getMyBrain() {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<ProcessedData> data = repository.findByUserId(userEmail);

        return ResponseEntity.ok(data);
    }
}