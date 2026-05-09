package com.example.assettrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    @Data
    @Builder
    public static class UsageStats {
        private long totalAllocations;
        private long activeAllocations;
        private long completedAllocations;
        private double avgAllocationDays;
        private List<MostAllocatedAsset> mostAllocatedAssets;
    }

    @Data
    @Builder
    public static class MostAllocatedAsset {
        private Long assetId;
        private String serialNumber;
        private String brand;
        private String model;
        private long allocationCount;
    }

    @Data
    @Builder
    public static class AllocationHistoryEntry {
        private Long id;
        private Long assetId;
        private String assetSerialNumber;
        private String assetBrand;
        private String assetModel;
        private Long userId;
        private String userEmail;
        private String userFullName;
        private String assignDate;
        private String returnDate;
    }

    @Data
    @Builder
    public static class ConditionSummary {
        private long totalReports;
        private Map<String, Long> reportsBySeverity;
        private List<ConditionReportEntry> recentReports;
    }

    @Data
    @Builder
    public static class ConditionReportEntry {
        private Long id;
        private Long assetId;
        private String assetSerialNumber;
        private String reportedByEmail;
        private String conditionStatus;
        private String notes;
        private String reportedAt;
    }
}
