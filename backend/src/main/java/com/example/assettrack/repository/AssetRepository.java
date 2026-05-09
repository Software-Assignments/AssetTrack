package com.example.assettrack.repository;

import com.example.assettrack.domain.Asset;
import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {
    boolean existsBySerialNumber(String serialNumber);

    Optional<Asset> findBySerialNumber(String serialNumber);

    List<Asset> findByWarrantyExpiryBetween(LocalDate startDate, LocalDate endDate);

    List<Asset> findByTypeAndStatusAndWarrantyExpiryBefore(AssetType type, AssetStatus status, LocalDate date);

    /** All assets of any type whose warranty has passed and are still in the given statuses. */
    List<Asset> findByStatusInAndWarrantyExpiryBefore(List<AssetStatus> statuses, LocalDate date);

    Optional<Asset> findFirstByTypeAndStatusOrderByIdAsc(AssetType type, AssetStatus status);
}

