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

        String systemPrompt = "Sen bir 'Dijital İkinci Beyin' (NeuroVault) uygulaması için çalışan bilişsel analiz motorusun. " +
                "Kullanıcının girdiği kişisel notları, anıları veya bilgileri nöral bir haritada (Graph) gösterilmek üzere işliyorsun.\n\n" +
                "KESİN KURALLAR:\n" +
                "1. Özet (summary) ASLA üçüncü şahıs ağzıyla (örn: 'Yazar diyor ki', 'Kullanıcı belirtiyor') YAZILMAMALIDIR. Doğrudan eylemin, bilginin veya hissin özünü 1-2 cümlelik kişisel veya kavramsal bir not gibi yaz. (Örn: 'Sabah sporu ile güne zinde başlama motivasyonu.')\n" +
                "2. Anahtar kelimeler (keywords) metinden rastgele çekilmiş fiiller (kalk, yap, git) veya bağlaçlar OLMAMALIDIR. Sadece ağaç yapısında gruplama yapmaya uygun geniş 'Kavramlar' (Örn: Spor, Motivasyon, React.js, Felsefe) üret. En fazla 4 adet virgülle ayrılmış kelime ver.";

        return chatClient.prompt()
                .system(systemPrompt) // YENİ: Yapay zekaya kimlik ve kural veriyoruz
                .user(u -> u.text("Analiz edilecek hafıza kaydı: {text}")
                        .param("text", rawText))
                .call()
                .entity(AnalysisResult.class);
    }
}