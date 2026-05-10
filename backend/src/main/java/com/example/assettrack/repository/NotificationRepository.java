package com.example.assettrack.repository;

import com.example.assettrack.domain.Notification;
import com.example.assettrack.domain.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // N+1 FIX: JOIN FETCH asset and currentOwner in a single query
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "LEFT JOIN FETCH n.recipientUser " +
           "WHERE n.recipientUser.id = :userId AND n.resolved = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientUserIdAndResolvedFalseOrderByCreatedAtDesc(@Param("userId") Long userId);

    // N+1 FIX: JOIN FETCH asset and currentOwner in a single query
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "LEFT JOIN FETCH n.recipientUser " +
           "WHERE n.recipientRole = :role AND n.resolved = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientRoleAndResolvedFalseOrderByCreatedAtDesc(@Param("role") Role role);

    // N+1 FIX: JOIN FETCH asset and currentOwner in a single query
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "LEFT JOIN FETCH n.recipientUser " +
           "WHERE n.resolved = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByResolvedFalseOrderByCreatedAtDesc();

    // N+1 FIX: JOIN FETCH asset and currentOwner in a single query
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "LEFT JOIN FETCH n.recipientUser " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findAllByOrderByCreatedAtDesc();

    // N+1 FIX: JOIN FETCH asset and currentOwner in a single query
    @Query("SELECT n FROM Notification n " +
           "LEFT JOIN FETCH n.asset a " +
           "LEFT JOIN FETCH a.currentOwner " +
           "LEFT JOIN FETCH n.recipientUser " +
           "WHERE (n.recipientUser.id = :userId OR n.recipientRole = :role) AND n.resolved = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findUnresolvedForUserOrRole(@Param("userId") Long userId, @Param("role") Role role);

    long countByRecipientUserIdAndReadFalse(Long userId);
}
