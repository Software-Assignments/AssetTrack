package com.example.assettrack.service;

import com.example.assettrack.domain.Role;
import com.example.assettrack.domain.User;
import com.example.assettrack.dto.request.AuthRequest;
import com.example.assettrack.dto.response.ApiResponse;
import com.example.assettrack.exception.ConflictException;
import com.example.assettrack.repository.UserRepository;
import com.example.assettrack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public ApiResponse.Auth signUp(AuthRequest.SignUp request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        Role role;
        String emailStr = request.getEmail().toLowerCase();
        if (emailStr.endsWith("@admin.com")) {
            role = Role.ADMIN;
        } else if (emailStr.endsWith("@manager.com")) {
            role = Role.MANAGER;
        } else if (userRepository.count() == 0) {
            role = Role.ADMIN;
        } else {
            role = Role.DEVELOPER;
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user);

        return ApiResponse.Auth.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public ApiResponse.Auth login(AuthRequest.Login request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user);

        return ApiResponse.Auth.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
