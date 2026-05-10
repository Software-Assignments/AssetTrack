package com.example.assettrack.repository;

import com.example.assettrack.domain.AllocationHistory;
import com.example.assettrack.domain.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AllocationHistoryRepository extends JpaRepository<AllocationHistory, Long> {

    Optional<AllocationHistory> findByAssetIdAndReturnDateIsNull(Long assetId);

    // N+1 FIX: JOIN FETCH user in a single query instead of lazy-loading per row
    @Query("SELECT h FROM AllocationHistory h " +
           "LEFT JOIN FETCH h.assignedUser " +
           "WHERE h.asset = :asset " +
           "ORDER BY h.assignDate DESC")
    List<AllocationHistory> findByAssetOrderByAssignDateDesc(@Param("asset") Asset asset);

    // N+1 FIX: JOIN FETCH user in a single query instead of lazy-loading per row
    @Query("SELECT h FROM AllocationHistory h " +
           "LEFT JOIN FETCH h.assignedUser " +
           "WHERE h.asset.id = :assetId " +
           "ORDER BY h.assignDate DESC")
    List<AllocationHistory> findByAssetIdOrderByAssignDateDesc(@Param("assetId") Long assetId);

    // N+1 FIX: JOIN FETCH asset (and its owner) in a single query
    @Query("SELECT h FROM AllocationHistory h " +
           "LEFT JOIN FETCH h.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "WHERE h.assignedUser.id = :userId " +
           "ORDER BY h.assignDate DESC")
    List<AllocationHistory> findByAssignedUserIdOrderByAssignDateDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT a.asset.id) FROM AllocationHistory a")
    long countDistinctAssets();

    @Query("SELECT a.asset.id, COUNT(a) FROM AllocationHistory a GROUP BY a.asset.id ORDER BY COUNT(a) DESC")
    List<Object[]> findMostAllocatedAssets();
}
