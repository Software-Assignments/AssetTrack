package com.example.assettrack.controller;

import com.example.assettrack.domain.User;
import com.example.assettrack.dto.request.UserRequest;
import com.example.assettrack.dto.response.ApiResponse;
import com.example.assettrack.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ADMIN + MANAGER can list all users
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ApiResponse.UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Any authenticated user can view their own profile
    @GetMapping("/me")
    public ResponseEntity<ApiResponse.UserDto> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.toDto(user));
    }

    // ADMIN + MANAGER can look up any user by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse.UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ADMIN only: change a user's role
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse.UserDto> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest.UpdateRole request) {
        return ResponseEntity.ok(userService.updateRole(id, request));
    }

    // ADMIN only: enable / disable a user account
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse.UserDto> toggleEnabled(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleEnabled(id));
    }

    // Any authenticated user can update their own display name
    @PutMapping("/me/profile")
    public ResponseEntity<ApiResponse.UserDto> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserRequest.UpdateProfile request) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }
}
