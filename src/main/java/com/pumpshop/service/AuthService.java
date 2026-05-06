package com.pumpshop.service;

import com.pumpshop.dto.auth.AuthResponse;
import com.pumpshop.dto.auth.LoginRequest;
import com.pumpshop.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void updateProfile(String username, RegisterRequest request);
    void changePassword(String username, String oldPassword, String newPassword);
}
