package com.example.assettrack.controller;

import com.example.assettrack.domain.User;
import com.example.assettrack.dto.response.NotificationResponseDTO;
import com.example.assettrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get current user's notifications (their own + role-based)
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user));
    }

    // ADMIN/MANAGER: Get all notifications
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // Get unread notification count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // Mark a notification as resolved
    @PutMapping("/{id}/resolve")
    public ResponseEntity<NotificationResponseDTO> resolveNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsResolved(id));
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
