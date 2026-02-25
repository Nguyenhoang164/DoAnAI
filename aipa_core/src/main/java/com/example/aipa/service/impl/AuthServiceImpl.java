package com.example.aipa.service.impl;

import com.example.aipa.dto.auth.AuthResponse;
import com.example.aipa.dto.auth.LoginRequest;
import com.example.aipa.dto.auth.RegisterRequest;
import com.example.aipa.model.User;
import com.example.aipa.repository.IUserRepository;
import com.example.aipa.security.JwtService;
import com.example.aipa.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final IUserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        String usernameOrEmail = request.getUsernameOrEmail().trim();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, request.getPassword())
        );

        User user = userRepository.findByUsernameOrEmail(usernameOrEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password"));

        org.springframework.security.core.userdetails.User principal =
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        user.isActive(),
                        true,
                        true,
                        true,
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(resolveRole(user))
                        )
                );

        String role = resolveRole(user);
        String accessToken = jwtService.generateToken(principal, role);
        return new AuthResponse(accessToken, "Bearer", role, "Login successful");
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(0);
        user.setActive(true);

        User savedUser = userRepository.save(user);
        String role = resolveRole(savedUser);
        org.springframework.security.core.userdetails.User principal =
                new org.springframework.security.core.userdetails.User(
                        savedUser.getUsername(),
                        savedUser.getPassword(),
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(role)
                        )
                );

        String accessToken = jwtService.generateToken(principal, role);
        return new AuthResponse(accessToken, "Bearer", role, "Register successful");
    }

    private String resolveRole(User user) {
        return user.getRole() == 1 ? "ROLE_ADMIN" : "ROLE_USER";
    }
}
