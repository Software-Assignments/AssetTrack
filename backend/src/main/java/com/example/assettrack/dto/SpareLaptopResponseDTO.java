package com.example.assettrack.dto;

import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;

import java.time.LocalDate;

public class SpareLaptopResponseDTO {

    private Long id;
    private AssetType type;
    private String brand;
    private String model;
    private String serialNumber;
    private LocalDate warrantyExpiry;
    private AssetStatus status;
    private Long lastOwnerId;
    private String lastOwnerEmail;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
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

    public Long getLastOwnerId() {
        return lastOwnerId;
    }

    public void setLastOwnerId(Long lastOwnerId) {
        this.lastOwnerId = lastOwnerId;
    }

    public String getLastOwnerEmail() {
        return lastOwnerEmail;
    }

    public void setLastOwnerEmail(String lastOwnerEmail) {
        this.lastOwnerEmail = lastOwnerEmail;
    }
}

