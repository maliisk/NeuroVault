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
                .system(systemPrompt)
                .user(u -> u.text("Analiz edilecek hafıza kaydı: {text}")
                        .param("text", rawText))
                .call()
                .entity(AnalysisResult.class);
    }

    public String askToBrain(String question, java.util.List<com.neurovault.cognitive_engine.dto.ContextDataDTO> contextData) {
        log.info("Gemini'ye RAG (Bağlamsal Soru) isteği gönderiliyor...");

        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < contextData.size(); i++) {
            var data = contextData.get(i);
            String content = data.getOriginalContent() != null ? data.getOriginalContent() : data.getSummary();
            contextBuilder.append(i + 1).append(". Hafıza Kaydı: ").append(content).append("\n");
        }

        String systemPrompt = "Sen 'NeuroVault' sisteminin Dijital İkinci Beyin asistanısın. " +
                "Kullanıcının sana sorduğu soruları SADECE aşağıda verilen 'BAĞLAM (Kullanıcının Notları)' verilerine dayanarak cevapla. " +
                "Eğer sorunun cevabı bu notlarda yoksa, asla dışarıdan bilgi uydurma ve kibarca 'Bu konu hakkında dijital beyninizde henüz bir kayıt/hafıza bulamadım.' de.\n" +
                "Cevaplarını sanki kullanıcının kendi beyni onunla konuşuyormuş gibi dostane, bilge ve yönlendirici bir tonda ver. Gerektiğinde Markdown formatı (madde işaretleri vs.) kullan.\n\n" +
                "--- BAĞLAM (KULLANICININ NOTLARI) ---\n" +
                contextBuilder.toString();

        return chatClient.prompt()
                .system(systemPrompt)
                .user(question)
                .call()
                .content();
    }
}