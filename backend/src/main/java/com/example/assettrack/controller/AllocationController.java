package com.example.assettrack.controller;

import com.example.assettrack.dto.AllocationRequestDTO;
import com.example.assettrack.dto.AssetResponseDTO;
import com.example.assettrack.dto.ReturnRequestDTO;
import com.example.assettrack.dto.response.AllocationHistoryDTO;
import com.example.assettrack.service.AllocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets/{assetId}")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    /**
     * Assign (or transfer) an asset to a user.
     * - To assign a free asset: POST with { "userId": X }
     * - To transfer from current owner: POST with { "userId": X, "transfer": true }
     * ADMIN + MANAGER only.
     */
    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetResponseDTO> allocateAsset(
            @PathVariable Long assetId,
            @Valid @RequestBody AllocationRequestDTO request) {
        return ResponseEntity.ok(allocationService.allocateAsset(assetId, request));
    }

    /**
     * Return an asset (sets returnDate, clears currentOwner, marks AVAILABLE).
     * ADMIN + MANAGER only.
     */
    @PostMapping("/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AssetResponseDTO> returnAsset(
            @PathVariable Long assetId,
            @RequestBody ReturnRequestDTO request) {
        return ResponseEntity.ok(allocationService.returnAsset(assetId, request));
    }

    /**
     * Get the full allocation history for an asset.
     * Any authenticated user can view.
     */
    @GetMapping("/allocation-history")
    public ResponseEntity<List<AllocationHistoryDTO>> getAllocationHistory(@PathVariable Long assetId) {
        return ResponseEntity.ok(allocationService.getAllocationHistory(assetId));
    }
}
