package com.example.assettrack.service;

import com.example.assettrack.domain.AlertSettings;
import com.example.assettrack.repository.AlertSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlertSettingsService {

    private final AlertSettingsRepository alertSettingsRepository;

    /** Returns the current settings, creating defaults on first call. */
    @Transactional
    public AlertSettings getSettings() {
        return alertSettingsRepository.findById(1L)
                .orElseGet(() -> alertSettingsRepository.save(new AlertSettings()));
    }

    /** Persists updated settings (always overwrites the singleton row). */
    @Transactional
    public AlertSettings updateSettings(AlertSettings incoming) {
        AlertSettings settings = getSettings();
        settings.setWarrantyExpiryDays(incoming.getWarrantyExpiryDays());
        settings.setShowExpiredAlerts(incoming.isShowExpiredAlerts());
        settings.setShowMaintenanceAlerts(incoming.isShowMaintenanceAlerts());
        return alertSettingsRepository.save(settings);
    }
}
