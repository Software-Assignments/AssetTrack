package com.example.assettrack.controller;

import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import com.example.assettrack.dto.AssetCreateRequestDTO;
import com.example.assettrack.dto.AssetResponseDTO;
import com.example.assettrack.dto.AssetUpdateRequestDTO;
import com.example.assettrack.dto.SpareLaptopResponseDTO;
import com.example.assettrack.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    // ADMIN only: register a new asset
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponseDTO> createAsset(@Valid @RequestBody AssetCreateRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(request));
    }

    // ADMIN + MANAGER: list all assets
    @GetMapping
    // @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AssetResponseDTO>> listAssets() {
        return ResponseEntity.ok(assetService.listAssets());
    }

    // Any authenticated user: retrieve a specific asset by ID
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAsset(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAsset(id));
    }

    // ADMIN only: update asset fields (type, brand, model, dates, status)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssetResponseDTO> updateAsset(
            @PathVariable Long id,
            @RequestBody AssetUpdateRequestDTO request) {
        return ResponseEntity.ok(assetService.updateAsset(id, request));
    }

    // ADMIN only: delete an asset (only if not currently assigned)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    // Advanced search: any combination of serial, status, type, brand,
    // owner-enabled flag, assignedUser email
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DEVELOPER')")
    public ResponseEntity<List<AssetResponseDTO>> searchAssets(
            @RequestParam(required = false) String serialNumber,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) AssetType type,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean assignedToEnabled,
            @RequestParam(required = false) String assignedUser) {
        return ResponseEntity.ok(
                assetService.searchAssets(serialNumber, status, type, brand, assignedToEnabled, assignedUser));
    }

    // Expiration tracking: assets whose warranty expires within the configured
    // window
    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AssetResponseDTO>> getExpiringAssets(
            @RequestParam(required = false) Integer windowDays) {
        return ResponseEntity.ok(assetService.getExpiringAssets(windowDays));
    }

    // Quick-find: first available spare laptop with last-owner info
    @GetMapping("/spare-laptop")
    public ResponseEntity<SpareLaptopResponseDTO> findSpareLaptop() {
        return ResponseEntity.ok(assetService.findSpareLaptop());
    }
}
