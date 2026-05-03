package com.example.assettrack.domain;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data // Lombok generates getters and setters automatically
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // Enum: ADMIN, MANAGER, DEVELOPER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status; // Enum: ACTIVE, INACTIVE

}