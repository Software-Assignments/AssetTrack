package com.example.assettrack.scheduler;

import com.example.assettrack.domain.*;
import com.example.assettrack.repository.AssetRepository;
import com.example.assettrack.repository.UserRepository;
import com.example.assettrack.service.AlertSettingsService;
import com.example.assettrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled task that runs daily to:
 * 1. Detect assets with warranties expiring within the configured window
 * 2. Detect assets with already expired warranties
 * 3. Create in-app notifications for ADMIN and MANAGER roles
 * 4. Send email notifications to ADMIN users
 * 5. Auto-flag expired assets (all types)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WarrantyExpirationScheduler {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AlertSettingsService alertSettingsService;

    /**
     * Runs every day at 8:00 AM.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkWarrantyExpirations() {
        log.info("Running warranty expiration check...");
        int windowDays = alertSettingsService.getSettings().getWarrantyExpiryDays();
        LocalDate today = LocalDate.now();
        LocalDate windowEnd = today.plusDays(windowDays);

        // 1. Find assets expiring soon (within the window, but not yet expired)
        List<Asset> expiringSoon = assetRepository.findByWarrantyExpiryBetween(today, windowEnd);
        for (Asset asset : expiringSoon) {
            if (asset.getStatus() == AssetStatus.DECOMMISSIONED) continue;

            String message = String.format(
                "Warranty for %s %s (S/N: %s) expires on %s. Consider renewing or replacing.",
                asset.getBrand(), asset.getModel(), asset.getSerialNumber(), asset.getWarrantyExpiry()
            );

            // Create in-app notifications for ADMIN and MANAGER roles
            notificationService.createRoleNotification(asset, Role.ADMIN,
                    NotificationType.WARRANTY_EXPIRING, message);
            notificationService.createRoleNotification(asset, Role.MANAGER,
                    NotificationType.WARRANTY_EXPIRING, message);

            // Send email to all ADMIN users
            sendEmailToAdmins(asset, "WARRANTY EXPIRING SOON", message);

            // Also notify current owner if assigned
            if (asset.getCurrentOwner() != null) {
                notificationService.createUserNotification(asset, asset.getCurrentOwner(),
                        NotificationType.WARRANTY_EXPIRING,
                        String.format("Your assigned asset %s %s (S/N: %s) warranty expires on %s.",
                                asset.getBrand(), asset.getModel(), asset.getSerialNumber(), asset.getWarrantyExpiry()));
            }
        }

        // 2. Find expired assets (any type) that haven't been flagged yet
        List<Asset> expiredAssets = assetRepository.findByStatusInAndWarrantyExpiryBefore(
                List.of(AssetStatus.ASSIGNED, AssetStatus.AVAILABLE, AssetStatus.IN_REPAIR), today);

        for (Asset asset : expiredAssets) {
            asset.setStatus(AssetStatus.EXPIRED);

            String message = String.format(
                "WARRANTY EXPIRED: %s %s (S/N: %s). Warranty expired on %s. Recommend: decommission or reassign as spare.",
                asset.getBrand(), asset.getModel(), asset.getSerialNumber(), asset.getWarrantyExpiry()
            );

            notificationService.createRoleNotification(asset, Role.ADMIN,
                    NotificationType.WARRANTY_EXPIRED, message);
            notificationService.createRoleNotification(asset, Role.MANAGER,
                    NotificationType.WARRANTY_EXPIRED, message);

            sendEmailToAdmins(asset, "WARRANTY EXPIRED", message);
        }

        log.info("Warranty check complete. Expiring soon: {}, Newly expired: {}",
                expiringSoon.size(), expiredAssets.size());
    }

    private void sendEmailToAdmins(Asset asset, String subjectSuffix, String message) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.sendEmailNotification(
                    admin.getEmail(),
                    "[AssetTrack] " + subjectSuffix + " — " + asset.getSerialNumber(),
                    message
            );
        }
    }
}
