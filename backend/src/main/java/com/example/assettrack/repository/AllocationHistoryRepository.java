package com.example.assettrack.repository;

import com.example.assettrack.domain.AllocationHistory;
import com.example.assettrack.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AllocationHistoryRepository extends JpaRepository<AllocationHistory, Long> {
    Optional<AllocationHistory> findByAssetIdAndReturnDateIsNull(Long assetId);

    List<AllocationHistory> findByAssetOrderByAssignDateDesc(Asset asset);

    List<AllocationHistory> findByAssetIdOrderByAssignDateDesc(Long assetId);

    List<AllocationHistory> findByAssignedUserIdOrderByAssignDateDesc(Long userId);

    @Query("SELECT COUNT(DISTINCT a.asset.id) FROM AllocationHistory a")
    long countDistinctAssets();

    @Query("SELECT a.asset.id, COUNT(a) FROM AllocationHistory a GROUP BY a.asset.id ORDER BY COUNT(a) DESC")
    List<Object[]> findMostAllocatedAssets();
}
