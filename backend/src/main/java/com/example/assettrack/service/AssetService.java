package com.example.assettrack.service;

import com.example.assettrack.dto.AssetCreateRequestDTO;
import com.example.assettrack.dto.AssetResponseDTO;
import com.example.assettrack.dto.AssetUpdateRequestDTO;
import com.example.assettrack.dto.SpareLaptopResponseDTO;
import com.example.assettrack.domain.AllocationHistory;
import com.example.assettrack.domain.Asset;
import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import com.example.assettrack.domain.User;
import com.example.assettrack.repository.AllocationHistoryRepository;
import com.example.assettrack.repository.AssetRepository;
import com.example.assettrack.exception.ConflictException;
import com.example.assettrack.exception.NotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AllocationHistoryRepository allocationHistoryRepository;

    private final int defaultExpiryWindowDays;

    public AssetService(
        AssetRepository assetRepository,
        AllocationHistoryRepository allocationHistoryRepository,
        @Value("${assettrack.expiration.window-days:30}") int defaultExpiryWindowDays
    ) {
        this.assetRepository = assetRepository;
        this.allocationHistoryRepository = allocationHistoryRepository;
        this.defaultExpiryWindowDays = defaultExpiryWindowDays;
    }

    @Transactional
    public AssetResponseDTO createAsset(AssetCreateRequestDTO request) {
        if (assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new ConflictException("Asset serial number already exists.");
        }

        Asset asset = new Asset();
        asset.setType(request.getType());
        asset.setBrand(request.getBrand());
        asset.setModel(request.getModel());
        asset.setSerialNumber(request.getSerialNumber());
        asset.setPurchaseDate(request.getPurchaseDate());
        asset.setWarrantyExpiry(request.getWarrantyExpiry());
        asset.setStatus(AssetStatus.AVAILABLE);

        Asset saved = assetRepository.save(asset);
        return toResponse(saved, defaultExpiryWindowDays);
    }

    @Transactional
    public AssetResponseDTO updateAsset(Long assetId, AssetUpdateRequestDTO request) {
        Asset asset = getAssetEntity(assetId);

        if (request.getType() != null) {
            asset.setType(request.getType());
        }
        if (request.getBrand() != null) {
            asset.setBrand(request.getBrand());
        }
        if (request.getModel() != null) {
            asset.setModel(request.getModel());
        }
        if (request.getPurchaseDate() != null) {
            asset.setPurchaseDate(request.getPurchaseDate());
        }
        if (request.getWarrantyExpiry() != null) {
            asset.setWarrantyExpiry(request.getWarrantyExpiry());
        }
        if (request.getStatus() != null) {
            asset.setStatus(request.getStatus());
        }

        return toResponse(asset, defaultExpiryWindowDays);
    }

    @Transactional
    public AssetResponseDTO getAsset(Long assetId) {
        refreshExpiredLaptops();
        return toResponse(getAssetEntity(assetId), defaultExpiryWindowDays);
    }

    @Transactional
    public List<AssetResponseDTO> searchAssets(
        String serialNumber,
        AssetStatus status,
        AssetType type,
        String brand,
        Boolean assignedToEnabled
    ) {
        refreshExpiredLaptops();
        Specification<Asset> spec = (root, query, cb) -> cb.conjunction();

        if (serialNumber != null && !serialNumber.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("serialNumber"), serialNumber));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (brand != null && !brand.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
        }
        if (assignedToEnabled != null) {
            spec = spec.and((root, query, cb) -> {
                var join = root.join("currentOwner", JoinType.LEFT);
                return cb.equal(join.get("enabled"), assignedToEnabled);
            });
        }

        List<AssetResponseDTO> responses = new ArrayList<>();
        for (Asset asset : assetRepository.findAll(spec)) {
            responses.add(toResponse(asset, defaultExpiryWindowDays));
        }
        return responses;
    }

    @Transactional
    public List<AssetResponseDTO> getExpiringAssets(Integer windowDays) {
        refreshExpiredLaptops();
        int window = windowDays != null ? windowDays : defaultExpiryWindowDays;
        LocalDate now = LocalDate.now();
        LocalDate end = now.plusDays(window);

        List<AssetResponseDTO> responses = new ArrayList<>();
        for (Asset asset : assetRepository.findByWarrantyExpiryBetween(now, end)) {
            responses.add(toResponse(asset, window));
        }
        return responses;
    }

    @Transactional
    public SpareLaptopResponseDTO findSpareLaptop() {
        refreshExpiredLaptops();
        Asset asset = assetRepository
            .findFirstByTypeAndStatusOrderByIdAsc(AssetType.LAPTOP, AssetStatus.AVAILABLE)
            .orElseThrow(() -> new NotFoundException("No available spare laptop found."));

        SpareLaptopResponseDTO response = new SpareLaptopResponseDTO();
        response.setId(asset.getId());
        response.setType(asset.getType());
        response.setBrand(asset.getBrand());
        response.setModel(asset.getModel());
        response.setSerialNumber(asset.getSerialNumber());
        response.setWarrantyExpiry(asset.getWarrantyExpiry());
        response.setStatus(asset.getStatus());

        Optional<AllocationHistory> lastAllocation = allocationHistoryRepository
            .findByAssetOrderByAssignDateDesc(asset)
            .stream()
            .findFirst();

        lastAllocation.ifPresent(allocation -> {
            response.setLastOwnerId(allocation.getAssignedUser().getId());
            response.setLastOwnerEmail(allocation.getAssignedUser().getEmail());
        });

        return response;
    }

    @Transactional(readOnly = true)
    public Asset getAssetEntity(Long assetId) {
        return assetRepository.findById(assetId)
            .orElseThrow(() -> new NotFoundException("Asset not found."));
    }

    @Transactional
    public List<AssetResponseDTO> listAssets() {
        refreshExpiredLaptops();
        List<AssetResponseDTO> responses = new ArrayList<>();
        for (Asset asset : assetRepository.findAll()) {
            responses.add(toResponse(asset, defaultExpiryWindowDays));
        }
        return responses;
    }

    @Transactional
    public void deleteAsset(Long assetId) {
        Asset asset = getAssetEntity(assetId);
        if (asset.getCurrentOwner() != null || allocationHistoryRepository.findByAssetIdAndReturnDateIsNull(assetId).isPresent()) {
            throw new ConflictException("Cannot delete an asset that is currently assigned.");
        }
        assetRepository.delete(asset);
    }

    private AssetResponseDTO toResponse(Asset asset, int windowDays) {
        AssetResponseDTO response = new AssetResponseDTO();
        response.setId(asset.getId());
        response.setType(asset.getType());
        response.setBrand(asset.getBrand());
        response.setModel(asset.getModel());
        response.setSerialNumber(asset.getSerialNumber());
        response.setPurchaseDate(asset.getPurchaseDate());
        response.setWarrantyExpiry(asset.getWarrantyExpiry());
        response.setStatus(asset.getStatus());

        if (asset.getCurrentOwner() != null) {
            response.setCurrentOwnerId(asset.getCurrentOwner().getId());
            response.setCurrentOwnerEmail(asset.getCurrentOwner().getEmail());
        }

        Optional<AllocationHistory> lastAllocation = allocationHistoryRepository
            .findByAssetOrderByAssignDateDesc(asset)
            .stream()
            .findFirst();

        lastAllocation.ifPresent(allocation -> {
            response.setLastOwnerId(allocation.getAssignedUser().getId());
            response.setLastOwnerEmail(allocation.getAssignedUser().getEmail());
        });

        String expirationStatus = computeExpirationStatus(asset, windowDays);
        response.setExpirationStatus(expirationStatus);
        response.setRecommendedAction(recommendAction(expirationStatus));

        return response;
    }

    private String computeExpirationStatus(Asset asset, int windowDays) {
        LocalDate today = LocalDate.now();
        if (asset.getWarrantyExpiry().isBefore(today)) {
            return "EXPIRED";
        }
        if (!asset.getWarrantyExpiry().isAfter(today.plusDays(windowDays))) {
            return "EXPIRING_SOON";
        }
        return "ACTIVE";
    }

    private String recommendAction(String expirationStatus) {
        if ("EXPIRED".equals(expirationStatus)) {
            return "DECOMMISSION";
        }
        if ("EXPIRING_SOON".equals(expirationStatus)) {
            return "REASSIGN_AS_SPARE";
        }
        return "";
    }

    private void refreshExpiredLaptops() {
        LocalDate today = LocalDate.now();
        Specification<Asset> spec = (root, query, cb) -> cb.and(
            cb.equal(root.get("type"), AssetType.LAPTOP),
            cb.lessThan(root.get("warrantyExpiry"), today),
            cb.notEqual(root.get("status"), AssetStatus.DECOMMISSIONED),
            cb.notEqual(root.get("status"), AssetStatus.EXPIRED)
        );

        for (Asset asset : assetRepository.findAll(spec)) {
            asset.setStatus(AssetStatus.EXPIRED);
        }
    }
}
