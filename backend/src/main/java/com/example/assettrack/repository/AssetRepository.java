package com.example.assettrack.repository;

import com.example.assettrack.domain.Asset;
import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

    boolean existsBySerialNumber(String serialNumber);

    Optional<Asset> findBySerialNumber(String serialNumber);

    // N+1 FIX: eager-fetch currentOwner for all assets in one query
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.currentOwner")
    List<Asset> findAllWithOwner();

    // N+1 FIX: eager-fetch currentOwner alongside warranty filter
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.currentOwner " +
           "WHERE a.warrantyExpiry BETWEEN :startDate AND :endDate")
    List<Asset> findByWarrantyExpiryBetween(@Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    // N+1 FIX: eager-fetch currentOwner alongside type/status/expiry filter
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.currentOwner " +
           "WHERE a.type = :type AND a.status = :status AND a.warrantyExpiry < :date")
    List<Asset> findByTypeAndStatusAndWarrantyExpiryBefore(@Param("type") AssetType type,
                                                            @Param("status") AssetStatus status,
                                                            @Param("date") LocalDate date);

    // N+1 FIX: eager-fetch currentOwner alongside status/expiry filter
    @Query("SELECT a FROM Asset a LEFT JOIN FETCH a.currentOwner " +
           "WHERE a.status IN :statuses AND a.warrantyExpiry < :date")
    List<Asset> findByStatusInAndWarrantyExpiryBefore(@Param("statuses") List<AssetStatus> statuses,
                                                       @Param("date") LocalDate date);

    Optional<Asset> findFirstByTypeAndStatusOrderByIdAsc(AssetType type, AssetStatus status);
}
