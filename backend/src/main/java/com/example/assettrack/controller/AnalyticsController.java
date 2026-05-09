package com.example.assettrack.controller;

import com.example.assettrack.dto.response.AnalyticsDTO;
import com.example.assettrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ADMIN + MANAGER: Get usage statistics
    @GetMapping("/usage")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.UsageStats> getUsageStats() {
        return ResponseEntity.ok(analyticsService.getUsageStats());
    }

    // ADMIN + MANAGER: Get allocation history with optional filters
    @GetMapping("/allocation-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AnalyticsDTO.AllocationHistoryEntry>> getAllocationHistory(
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(analyticsService.getAllocationHistory(assetId, userId));
    }

    // ADMIN + MANAGER: Get condition report summary
    @GetMapping("/condition-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AnalyticsDTO.ConditionSummary> getConditionSummary() {
        return ResponseEntity.ok(analyticsService.getConditionSummary());
    }
}
