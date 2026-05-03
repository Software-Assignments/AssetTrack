package com.example.assettrack.repository;

import com.example.assettrack.domain.AllocationHistory;
import com.example.assettrack.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AllocationHistoryRepository extends JpaRepository<AllocationHistory, Long> {
    Optional<AllocationHistory> findByAssetIdAndReturnDateIsNull(Long assetId);

    List<AllocationHistory> findByAssetOrderByAssignDateDesc(Asset asset);
}

