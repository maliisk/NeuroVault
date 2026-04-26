package com.neurovault.ingestion_service.repository;

import com.neurovault.ingestion_service.document.RawData;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawDataRepository extends ReactiveMongoRepository<RawData, String> {
}