package com.example.assettrack.dto;

import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * All fields are optional — only non-null values are applied.
 * String fields, when provided, must not be blank.
 */
public class AssetUpdateRequestDTO {

    private AssetType type;

    @NotBlank(message = "Brand must not be blank when provided")
    private String brand;

    @NotBlank(message = "Model must not be blank when provided")
    private String model;

    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;
    private AssetStatus status;

    public AssetType getType() {
        return type;
    }

    public void setType(AssetType type) {
        this.type = type;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getWarrantyExpiry() {
        return warrantyExpiry;
    }

    public void setWarrantyExpiry(LocalDate warrantyExpiry) {
        this.warrantyExpiry = warrantyExpiry;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }
}
