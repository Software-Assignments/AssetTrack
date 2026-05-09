package com.example.assettrack.service;

import com.example.assettrack.domain.*;
import com.example.assettrack.dto.response.DashboardSummaryDTO;
import com.example.assettrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AllocationHistoryRepository allocationHistoryRepository;
    private final AssetConditionReportRepository conditionReportRepository;

    @Value("${assettrack.expiration.window-days:30}")
    private int defaultExpiryWindowDays;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        List<Asset> allAssets = assetRepository.findAll();
        long totalUsers = userRepository.count();

        // Asset counts by status
        Map<String, Long> assetsByStatus = allAssets.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getStatus().name(),
                        Collectors.counting()
                ));

        // Asset counts by type
        Map<String, Long> assetsByType = allAssets.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getType().name(),
                        Collectors.counting()
                ));

        // Warranty status distribution
        LocalDate today = LocalDate.now();
        LocalDate windowEnd = today.plusDays(defaultExpiryWindowDays);
        Map<String, Long> warrantyStatus = new LinkedHashMap<>();
        long expired = 0, expiringSoon = 0, active = 0;
        for (Asset asset : allAssets) {
            if (asset.getWarrantyExpiry().isBefore(today)) {
                expired++;
            } else if (!asset.getWarrantyExpiry().isAfter(windowEnd)) {
                expiringSoon++;
            } else {
                active++;
            }
        }
        warrantyStatus.put("EXPIRED", expired);
        warrantyStatus.put("EXPIRING_SOON", expiringSoon);
        warrantyStatus.put("ACTIVE", active);

        // Active allocations count
        long activeAllocations = allAssets.stream()
                .filter(a -> a.getCurrentOwner() != null)
                .count();

        // Recent allocations (last 10)
        List<AllocationHistory> recentAllocs = allocationHistoryRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(AllocationHistory::getAssignDate).reversed())
                .limit(10)
                .toList();

        List<DashboardSummaryDTO.RecentAllocation> recentAllocations = recentAllocs.stream()
                .map(a -> DashboardSummaryDTO.RecentAllocation.builder()
                        .assetId(a.getAsset().getId())
                        .assetSerialNumber(a.getAsset().getSerialNumber())
                        .assetBrand(a.getAsset().getBrand())
                        .assetModel(a.getAsset().getModel())
                        .userId(a.getAssignedUser().getId())
                        .userEmail(a.getAssignedUser().getEmail())
                        .assignDate(a.getAssignDate().toString())
                        .returnDate(a.getReturnDate() != null ? a.getReturnDate().toString() : null)
                        .build())
                .collect(Collectors.toList());

        // Recent condition reports (last 10)
        List<ConditionReport> recentReports = conditionReportRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(ConditionReport::getReportedAt).reversed())
                .limit(10)
                .toList();

        List<DashboardSummaryDTO.RecentConditionReport> recentConditionReports = recentReports.stream()
                .map(r -> DashboardSummaryDTO.RecentConditionReport.builder()
                        .reportId(r.getId())
                        .assetId(r.getAsset().getId())
                        .assetSerialNumber(r.getAsset().getSerialNumber())
                        .reportedByEmail(r.getReportedBy().getEmail())
                        .conditionStatus(r.getConditionStatus())
                        .notes(r.getNotes())
                        .reportedAt(r.getReportedAt().toString())
                        .build())
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .totalAssets(allAssets.size())
                .totalUsers(totalUsers)
                .activeAllocations(activeAllocations)
                .assetsByStatus(assetsByStatus)
                .assetsByType(assetsByType)
                .warrantyStatus(warrantyStatus)
                .recentAllocations(recentAllocations)
                .recentConditionReports(recentConditionReports)
                .build();
    }
}
