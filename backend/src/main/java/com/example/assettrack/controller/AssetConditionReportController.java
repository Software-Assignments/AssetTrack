package com.example.assettrack.controller;

import com.example.assettrack.domain.ConditionReport;
import com.example.assettrack.domain.User;
import com.example.assettrack.dto.request.ConditionReportRequestDto;
import com.example.assettrack.dto.response.ConditionReportResponseDTO;
import com.example.assettrack.service.AssetConditionReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class AssetConditionReportController {

    private final AssetConditionReportService reportService;

    // Any authenticated user can submit a report for an asset
    @PostMapping
    public ResponseEntity<ConditionReportResponseDTO> submitReport(
            @Valid @RequestBody ConditionReportRequestDto dto,
            @AuthenticationPrincipal User user) {
        ConditionReportResponseDTO savedReport = reportService.submitReport(dto, user.getId());
        return ResponseEntity.ok(savedReport);
    }

    // Only Admins and Managers can view all reports
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ConditionReportResponseDTO>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    // Get reports for a specific asset
    @GetMapping("/asset/{assetId}")
    public ResponseEntity<List<ConditionReportResponseDTO>> getReportsByAsset(@PathVariable Long assetId) {
        return ResponseEntity.ok(reportService.getReportsByAssetId(assetId));
    }

    // Get reports submitted by the current user
    @GetMapping("/my-reports")
    public ResponseEntity<List<ConditionReportResponseDTO>> getMyReports(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reportService.getReportsByUserId(user.getId()));
    }
}
