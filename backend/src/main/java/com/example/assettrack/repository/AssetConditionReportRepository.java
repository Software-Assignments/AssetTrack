package com.example.assettrack.repository;

import com.example.assettrack.domain.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetConditionReportRepository extends JpaRepository<ConditionReport, Long> {

    List<ConditionReport> findByAsset_IdOrderByReportedAtDesc(Long assetId);

    List<ConditionReport> findByReportedBy_IdOrderByReportedAtDesc(Long userId);

    long countByConditionStatus(String conditionStatus);
}
