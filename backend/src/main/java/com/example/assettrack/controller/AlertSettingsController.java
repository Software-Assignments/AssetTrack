package com.example.assettrack.controller;

import com.example.assettrack.domain.AlertSettings;
import com.example.assettrack.service.AlertSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alert-settings")
@RequiredArgsConstructor
public class AlertSettingsController {

    private final AlertSettingsService alertSettingsService;

    /** Retrieve current alert settings. ADMIN + MANAGER only. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AlertSettings> getSettings() {
        return ResponseEntity.ok(alertSettingsService.getSettings());
    }

    /** Update alert settings. ADMIN only. */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlertSettings> updateSettings(@RequestBody AlertSettings settings) {
        return ResponseEntity.ok(alertSettingsService.updateSettings(settings));
    }
}
