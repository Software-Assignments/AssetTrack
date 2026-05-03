package com.example.assettrack.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "assets",
    indexes = {
        @Index(name = "idx_assets_type_status", columnList = "type,status"),
        @Index(name = "idx_assets_serial", columnList = "serial_number", unique = true)
    }
)
@Data
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type; // LAPTOP, SCREEN, ACCESSORY

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(name = "serial_number", unique = true, nullable = false)
    private String serialNumber;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate warrantyExpiry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetStatus status; // AVAILABLE, ASSIGNED, IN_REPAIR, EXPIRED, DECOMMISSIONED

    @ManyToOne
    @JoinColumn(name = "current_owner_id")
    private User currentOwner;

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AllocationHistory> allocationHistory = new ArrayList<>();

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ConditionReport> conditionReports = new ArrayList<>();

    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();
}