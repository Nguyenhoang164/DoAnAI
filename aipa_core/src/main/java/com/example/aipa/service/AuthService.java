package com.example.aipa.service;

import com.example.aipa.dto.auth.AuthResponse;
import com.example.aipa.dto.auth.LoginRequest;
import com.example.aipa.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
