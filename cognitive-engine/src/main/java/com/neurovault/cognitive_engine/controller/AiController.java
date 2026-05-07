package com.neurovault.cognitive_engine.controller;

import com.neurovault.cognitive_engine.dto.AiChatRequest;
import com.neurovault.cognitive_engine.dto.AiChatResponse;
import com.neurovault.cognitive_engine.service.CognitiveAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final CognitiveAiService aiService;

    @PostMapping("/generate-answer")
    public ResponseEntity<AiChatResponse> generateAnswer(@RequestBody AiChatRequest request) {
        String answer = aiService.askToBrain(request.getQuestion(), request.getContextData());
        return ResponseEntity.ok(new AiChatResponse(answer));
    }
}