package com.neurovault.query_service.repository;

import com.neurovault.query_service.entity.ProcessedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProcessedDataRepository extends JpaRepository<ProcessedData, Long> {
    List<ProcessedData> findByUserId(String userId);
}