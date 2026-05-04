package com.example.assettrack.service;

import com.example.assettrack.domain.User;
import com.example.assettrack.dto.request.UserRequest;
import com.example.assettrack.dto.response.ApiResponse;
import com.example.assettrack.exception.NotFoundException;
import com.example.assettrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<ApiResponse.UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public ApiResponse.UserDto getUserById(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public ApiResponse.UserDto updateRole(Long id, UserRequest.UpdateRole request) {
        User user = findById(id);
        user.setRole(request.getRole());
        return toDto(userRepository.save(user));
    }

    @Transactional
    public ApiResponse.UserDto toggleEnabled(Long id) {
        User user = findById(id);
        user.setEnabled(!user.isEnabled());
        return toDto(userRepository.save(user));
    }

    @Transactional
    public ApiResponse.UserDto updateProfile(Long id, UserRequest.UpdateProfile request) {
        User user = findById(id);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        return toDto(userRepository.save(user));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    public ApiResponse.UserDto toDto(User user) {
        return ApiResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
