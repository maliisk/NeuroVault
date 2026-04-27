package com.neurovault.cognitive_engine.repository;

import com.neurovault.cognitive_engine.entity.ProcessedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedDataRepository extends JpaRepository<ProcessedData, Long> {
}