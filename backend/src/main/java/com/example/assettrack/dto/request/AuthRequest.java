package com.example.assettrack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class SignUp {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank
        private String fullName;
    }

    @Data
    public static class Login {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }
}
