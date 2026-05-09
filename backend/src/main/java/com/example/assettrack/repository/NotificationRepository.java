package com.example.assettrack.repository;

import com.example.assettrack.domain.Notification;
import com.example.assettrack.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdAndResolvedFalseOrderByCreatedAtDesc(Long userId);

    List<Notification> findByRecipientRoleAndResolvedFalseOrderByCreatedAtDesc(Role role);

    List<Notification> findByResolvedFalseOrderByCreatedAtDesc();

    List<Notification> findAllByOrderByCreatedAtDesc();

    @Query("SELECT n FROM Notification n WHERE (n.recipientUser.id = :userId OR n.recipientRole = :role) AND n.resolved = false ORDER BY n.createdAt DESC")
    List<Notification> findUnresolvedForUserOrRole(@Param("userId") Long userId, @Param("role") Role role);

    long countByRecipientUserIdAndReadFalse(Long userId);
}
