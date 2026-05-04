package com.example.assettrack.dto.response;

import com.example.assettrack.domain.AssetStatus;
import com.example.assettrack.domain.AssetType;
import com.example.assettrack.domain.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ApiResponse {

    @Data
    @Builder
    public static class Auth {
        private String token;
        private String email;
        private String fullName;
        private String role;
    }

    @Data
    @Builder
    public static class UserDto {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private boolean enabled;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class AssetDto {
        private Long id;
        private AssetType type;
        private String brand;
        private String model;
        private String serialNumber;
        private LocalDate purchaseDate;
        private LocalDate warrantyExpiry;
        private AssetStatus status;
        private String expirationStatus;
        private String recommendedAction;
        private Long currentOwnerId;
        private String currentOwnerEmail;
        private Long lastOwnerId;
        private String lastOwnerEmail;
    }

    @Data
    @Builder
    public static class MessageResponse {
        private String message;
    }
}
