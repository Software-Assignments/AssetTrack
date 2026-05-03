package com.example.assettrack.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "condition_reports",
    indexes = {
        @Index(name = "idx_condition_reports_asset", columnList = "asset_id"),
        @Index(name = "idx_condition_reports_reported_by", columnList = "reported_by_id")
    }
)
@Data
public class ConditionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;

    @CreationTimestamp // Automatically sets the time when saved to the database
    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    @Column(nullable = false)
    private String conditionStatus;

    private String notes;
}
