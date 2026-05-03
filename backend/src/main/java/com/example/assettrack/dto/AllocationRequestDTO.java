package com.example.assettrack.dto;

import jakarta.validation.constraints.NotNull;

public class AllocationRequestDTO {

    @NotNull
    private Long userId;

    private boolean transfer;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isTransfer() {
        return transfer;
    }

    public void setTransfer(boolean transfer) {
        this.transfer = transfer;
    }
}

