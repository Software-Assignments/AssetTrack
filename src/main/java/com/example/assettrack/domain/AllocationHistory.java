package com.example.assettrack.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(
    name = "allocations",
    indexes = {
        @Index(name = "idx_allocations_asset", columnList = "asset_id"),
        @Index(name = "idx_allocations_user", columnList = "user_id")
    }
)
@Data
public class AllocationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship: Many allocations belong to one asset
    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    // Relationship: Many allocations belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User assignedUser;

    @Column(nullable = false)
    private LocalDate assignDate;

    private LocalDate returnDate; // null when still assigned
}