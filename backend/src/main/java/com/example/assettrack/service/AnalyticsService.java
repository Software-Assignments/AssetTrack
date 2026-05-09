package com.example.assettrack.service;

import com.example.assettrack.domain.AllocationHistory;
import com.example.assettrack.domain.Asset;
import com.example.assettrack.domain.ConditionReport;
import com.example.assettrack.dto.response.AnalyticsDTO;
import com.example.assettrack.repository.AllocationHistoryRepository;
import com.example.assettrack.repository.AssetConditionReportRepository;
import com.example.assettrack.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AllocationHistoryRepository allocationHistoryRepository;
    private final AssetConditionReportRepository conditionReportRepository;
    private final AssetRepository assetRepository;

    /**
     * Usage statistics: total/active/completed allocations, avg duration, most-allocated assets.
     */
    @Transactional(readOnly = true)
    public AnalyticsDTO.UsageStats getUsageStats() {
        List<AllocationHistory> allAllocations = allocationHistoryRepository.findAll();

        long total = allAllocations.size();
        long active = allAllocations.stream().filter(a -> a.getReturnDate() == null).count();
        long completed = total - active;

        // Average allocation duration (completed allocations only)
        double avgDays = allAllocations.stream()
                .filter(a -> a.getReturnDate() != null)
                .mapToLong(a -> ChronoUnit.DAYS.between(a.getAssignDate(), a.getReturnDate()))
                .average()
                .orElse(0.0);

        // Most allocated assets (top 10)
        List<Object[]> mostAllocated = allocationHistoryRepository.findMostAllocatedAssets();
        List<AnalyticsDTO.MostAllocatedAsset> mostAllocatedAssets = mostAllocated.stream()
                .limit(10)
                .map(row -> {
                    Long assetId = (Long) row[0];
                    Long count = (Long) row[1];
                    Asset asset = assetRepository.findById(assetId).orElse(null);
                    return AnalyticsDTO.MostAllocatedAsset.builder()
                            .assetId(assetId)
                            .serialNumber(asset != null ? asset.getSerialNumber() : "N/A")
                            .brand(asset != null ? asset.getBrand() : "N/A")
                            .model(asset != null ? asset.getModel() : "N/A")
                            .allocationCount(count)
                            .build();
                })
                .collect(Collectors.toList());

        return AnalyticsDTO.UsageStats.builder()
                .totalAllocations(total)
                .activeAllocations(active)
                .completedAllocations(completed)
                .avgAllocationDays(Math.round(avgDays * 100.0) / 100.0)
                .mostAllocatedAssets(mostAllocatedAssets)
                .build();
    }

    /**
     * Get full allocation history, optionally filtered by assetId or userId.
     */
    @Transactional(readOnly = true)
    public List<AnalyticsDTO.AllocationHistoryEntry> getAllocationHistory(Long assetId, Long userId) {
        List<AllocationHistory> history;

        if (assetId != null) {
            history = allocationHistoryRepository.findByAssetIdOrderByAssignDateDesc(assetId);
        } else if (userId != null) {
            history = allocationHistoryRepository.findByAssignedUserIdOrderByAssignDateDesc(userId);
        } else {
            history = allocationHistoryRepository.findAll();
            history.sort(Comparator.comparing(AllocationHistory::getAssignDate).reversed());
        }

        return history.stream()
                .map(a -> AnalyticsDTO.AllocationHistoryEntry.builder()
                        .id(a.getId())
                        .assetId(a.getAsset().getId())
                        .assetSerialNumber(a.getAsset().getSerialNumber())
                        .assetBrand(a.getAsset().getBrand())
                        .assetModel(a.getAsset().getModel())
                        .userId(a.getAssignedUser().getId())
                        .userEmail(a.getAssignedUser().getEmail())
                        .userFullName(a.getAssignedUser().getFullName())
                        .assignDate(a.getAssignDate().toString())
                        .returnDate(a.getReturnDate() != null ? a.getReturnDate().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Condition report summary: total reports, breakdown by severity, recent reports.
     */
    @Transactional(readOnly = true)
    public AnalyticsDTO.ConditionSummary getConditionSummary() {
        List<ConditionReport> allReports = conditionReportRepository.findAll();

        Map<String, Long> reportsBySeverity = allReports.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getConditionStatus() != null ? r.getConditionStatus() : "UNKNOWN",
                        Collectors.counting()
                ));

        List<AnalyticsDTO.ConditionReportEntry> recentReports = allReports.stream()
                .sorted(Comparator.comparing(ConditionReport::getReportedAt).reversed())
                .limit(20)
                .map(r -> AnalyticsDTO.ConditionReportEntry.builder()
                        .id(r.getId())
                        .assetId(r.getAsset().getId())
                        .assetSerialNumber(r.getAsset().getSerialNumber())
                        .reportedByEmail(r.getReportedBy().getEmail())
                        .conditionStatus(r.getConditionStatus())
                        .notes(r.getNotes())
                        .reportedAt(r.getReportedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return AnalyticsDTO.ConditionSummary.builder()
                .totalReports(allReports.size())
                .reportsBySeverity(reportsBySeverity)
                .recentReports(recentReports)
                .build();
    }
}
