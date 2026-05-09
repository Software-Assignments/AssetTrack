package com.example.assettrack.controller;

import com.example.assettrack.dto.response.DashboardSummaryDTO;
import com.example.assettrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // ADMIN + MANAGER: Get full dashboard summary
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}
