package com.example.assettrack.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "alert_settings")
@Data
public class AlertSettings {

    /** Always ID=1 — singleton row. */
    @Id
    private Long id = 1L;

    /** Days before warranty expiry to start sending warnings. */
    @Column(nullable = false)
    private int warrantyExpiryDays = 30;

    /** Whether to surface in-app alerts for already-expired assets. */
    @Column(nullable = false)
    private boolean showExpiredAlerts = true;

    /** Whether to surface in-app alerts when an asset enters maintenance. */
    @Column(nullable = false)
    private boolean showMaintenanceAlerts = true;
}
