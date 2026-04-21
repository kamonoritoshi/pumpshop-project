package com.pumpshop.service;

import com.pumpshop.dto.auth.AuthResponse;
import com.pumpshop.dto.auth.LoginRequest;
import com.pumpshop.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
