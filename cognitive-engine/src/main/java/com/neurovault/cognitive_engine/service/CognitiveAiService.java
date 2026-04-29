package com.neurovault.cognitive_engine.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CognitiveAiService {

    private final ChatClient chatClient;

    public CognitiveAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public AnalysisResult analyzeText(String rawText) {
        log.info("Gemini'ye analiz için metin gönderiliyor...");

        return chatClient.prompt()
                .user(u -> u.text("Aşağıdaki metni analiz et. Metnin kısa ve öz bir özetini (summary) " +
                                "ve en fazla 4 kelimelik bir anahtar kelime listesini (keywords) çıkar. " +
                                "Metin: {text}")
                        .param("text", rawText))
                .call()
                .entity(AnalysisResult.class);
    }
}