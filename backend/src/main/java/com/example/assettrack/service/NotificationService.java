package com.example.assettrack.service;

import com.example.assettrack.domain.*;
import com.example.assettrack.dto.response.NotificationResponseDTO;
import com.example.assettrack.exception.NotFoundException;
import com.example.assettrack.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${assettrack.mail.from:noreply@assettrack.local}")
    private String fromAddress;

    /**
     * Create an in-app notification for a specific user.
     */
    @Transactional
    public Notification createUserNotification(Asset asset, User recipientUser,
                                                NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setAsset(asset);
        notification.setRecipientUser(recipientUser);
        notification.setType(type);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setResolved(false);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Create an in-app notification targeted at a role (e.g., all ADMINs).
     */
    @Transactional
    public Notification createRoleNotification(Asset asset, Role recipientRole,
                                                NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setAsset(asset);
        notification.setRecipientRole(recipientRole);
        notification.setType(type);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setResolved(false);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Send an email notification via SMTP (MailHog for testing).
     */
    public void sendEmailNotification(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(toEmail);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
            log.info("Email sent to {} — subject: {}", toEmail, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Create an email notification record and send the email.
     */
    @Transactional
    public Notification createAndSendEmailNotification(Asset asset, User recipientUser,
                                                        NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setAsset(asset);
        notification.setRecipientUser(recipientUser);
        notification.setType(type);
        notification.setChannel(NotificationChannel.EMAIL);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setResolved(false);
        notification.setRead(false);

        sendEmailNotification(recipientUser.getEmail(),
                "[AssetTrack] " + type.name().replace("_", " "),
                message);

        notification.setSentAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    /**
     * Get unresolved notifications for a user (their own + their role's).
     */
    public List<NotificationResponseDTO> getNotificationsForUser(User user) {
        List<Notification> notifications = notificationRepository
                .findUnresolvedForUserOrRole(user.getId(), user.getRole());
        return notifications.stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Get all notifications (ADMIN/MANAGER view).
     */
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    /**
     * Mark a notification as resolved.
     */
    @Transactional
    public NotificationResponseDTO markAsResolved(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        notification.setResolved(true);
        return toDto(notificationRepository.save(notification));
    }

    /**
     * Mark a notification as read.
     */
    @Transactional
    public NotificationResponseDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + notificationId));
        notification.setRead(true);
        return toDto(notificationRepository.save(notification));
    }

    /**
     * Get unread notification count for a user.
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    private NotificationResponseDTO toDto(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .assetId(n.getAsset() != null ? n.getAsset().getId() : null)
                .assetSerialNumber(n.getAsset() != null ? n.getAsset().getSerialNumber() : null)
                .type(n.getType())
                .channel(n.getChannel())
                .recipientUserId(n.getRecipientUser() != null ? n.getRecipientUser().getId() : null)
                .recipientUserEmail(n.getRecipientUser() != null ? n.getRecipientUser().getEmail() : null)
                .recipientRole(n.getRecipientRole())
                .message(n.getMessage())
                .createdAt(n.getCreatedAt())
                .sentAt(n.getSentAt())
                .resolved(n.isResolved())
                .read(n.isRead())
                .build();
    }
}
