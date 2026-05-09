package com.example.assettrack.dto.response;

import com.example.assettrack.domain.NotificationChannel;
import com.example.assettrack.domain.NotificationType;
import com.example.assettrack.domain.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {
    private Long id;
    private Long assetId;
    private String assetSerialNumber;
    private NotificationType type;
    private NotificationChannel channel;
    private Long recipientUserId;
    private String recipientUserEmail;
    private Role recipientRole;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private boolean resolved;
    private boolean read;
}
