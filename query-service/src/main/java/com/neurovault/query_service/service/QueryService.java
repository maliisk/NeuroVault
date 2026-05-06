package com.neurovault.query_service.service;

import com.neurovault.query_service.entity.ProcessedData;
import com.neurovault.query_service.repository.ProcessedDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QueryService {

    private final ProcessedDataRepository repository;

    public void deleteMemory(Long id, String userEmail) {
        // 1. Veritabanından düğümü bul
        ProcessedData data = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hafıza bulunamadı veya zaten silinmiş!"));

        // 2. Güvenlik Kontrolü: Bu veri gerçekten silmek isteyen kullanıcıya mı ait?
        if (!data.getUserId().equals(userEmail)) {
            throw new RuntimeException("Yetkisiz işlem! Sadece kendi hafızalarınızı silebilirsiniz.");
        }

        // 3. Veriyi sil (Hibernate, @ElementCollection sayesinde alt etiketleri de otomatik temizler)
        repository.delete(data);
    }
}