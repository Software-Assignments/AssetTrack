package com.example.assettrack.dto.request;

import com.example.assettrack.domain.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class UserRequest {

    @Data
    public static class UpdateRole {
        @NotNull
        private Role role;
    }

    @Data
    public static class UpdateProfile {
        private String fullName;
    }
}
