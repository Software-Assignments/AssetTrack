package com.example.assettrack.service;

import com.example.assettrack.dto.AllocationRequestDTO;
import com.example.assettrack.dto.AssetResponseDTO;
import com.example.assettrack.dto.ReturnRequestDTO;
import com.example.assettrack.domain.*;
import com.example.assettrack.repository.AllocationHistoryRepository;
import com.example.assettrack.repository.UserRepository;
import com.example.assettrack.service.exception.BadRequestException;
import com.example.assettrack.service.exception.ConflictException;
import com.example.assettrack.service.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AllocationService {

    private final UserRepository userRepository;
    private final AllocationHistoryRepository allocationHistoryRepository;
    private final AssetService assetService;

    public AllocationService(
        UserRepository userRepository,
        AllocationHistoryRepository allocationHistoryRepository,
        AssetService assetService
    ) {
        this.userRepository = userRepository;
        this.allocationHistoryRepository = allocationHistoryRepository;
        this.assetService = assetService;
    }

    @Transactional
    public AssetResponseDTO allocateAsset(Long assetId, AllocationRequestDTO request) {
        Asset asset = assetService.getAssetEntity(assetId);
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new NotFoundException("User not found."));

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("Cannot assign asset to an inactive user.");
        }

        if (asset.getCurrentOwner() != null && !request.isTransfer()) {
            throw new ConflictException("Asset is already assigned. Use transfer to reassign.");
        }

        if (asset.getCurrentOwner() != null && request.isTransfer()) {
            AllocationHistory activeAllocation = allocationHistoryRepository
                .findByAssetIdAndReturnDateIsNull(asset.getId())
                .orElseThrow(() -> new ConflictException("Active allocation not found for transfer."));
            activeAllocation.setReturnDate(LocalDate.now());
        }

        AllocationHistory allocation = new AllocationHistory();
        allocation.setAsset(asset);
        allocation.setAssignedUser(user);
        allocation.setAssignDate(LocalDate.now());
        allocationHistoryRepository.save(allocation);

        asset.setCurrentOwner(user);
        asset.setStatus(AssetStatus.ASSIGNED);

        return assetService.getAsset(asset.getId());
    }

    @Transactional
    public AssetResponseDTO returnAsset(Long assetId, ReturnRequestDTO request) {
        Asset asset = assetService.getAssetEntity(assetId);
        AllocationHistory activeAllocation = allocationHistoryRepository
            .findByAssetIdAndReturnDateIsNull(assetId)
            .orElseThrow(() -> new ConflictException("Asset is not currently assigned."));

        LocalDate returnDate = request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now();
        if (returnDate.isBefore(activeAllocation.getAssignDate())) {
            throw new BadRequestException("Return date cannot be before assign date.");
        }

        activeAllocation.setReturnDate(returnDate);
        asset.setCurrentOwner(null);
        asset.setStatus(AssetStatus.AVAILABLE);

        return assetService.getAsset(asset.getId());
    }
}
