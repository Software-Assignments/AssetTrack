package com.example.assettrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardSummaryDTO {

    private long totalAssets;
    private long totalUsers;
    private long activeAllocations;

    // Counts by status: AVAILABLE -> 5, ASSIGNED -> 10, etc.
    private Map<String, Long> assetsByStatus;

    // Counts by type: LAPTOP -> 8, SCREEN -> 3, etc.
    private Map<String, Long> assetsByType;

    // Warranty status: ACTIVE, EXPIRING_SOON, EXPIRED
    private Map<String, Long> warrantyStatus;

    // Recent allocations
    private List<RecentAllocation> recentAllocations;

    // Recent condition reports
    private List<RecentConditionReport> recentConditionReports;

    @Data
    @Builder
    public static class RecentAllocation {
        private Long assetId;
        private String assetSerialNumber;
        private String assetBrand;
        private String assetModel;
        private Long userId;
        private String userEmail;
        private String assignDate;
        private String returnDate;
    }

    @Data
    @Builder
    public static class RecentConditionReport {
        private Long reportId;
        private Long assetId;
        private String assetSerialNumber;
        private String reportedByEmail;
        private String conditionStatus;
        private String notes;
        private String reportedAt;
    }
}
