package com.pumpshop.service.impl;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pumpshop.dto.auth.AuthResponse;
import com.pumpshop.dto.auth.LoginRequest;
import com.pumpshop.dto.auth.RegisterRequest;
import com.pumpshop.entity.Role;
import com.pumpshop.entity.User;
import com.pumpshop.repository.UserRepository;
import com.pumpshop.security.JwtUtil;
import com.pumpshop.security.UserDetailsServiceImpl;
import com.pumpshop.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại");
        }

        // Gán role mặc định ROLE_USER
        Role userRole = new Role();
        userRole.setId(1L); // ID=1 được seed sẵn trong DB cho ROLE_USER
        userRole.setName("ROLE_USER");

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(token, user.getUsername(), user.getFullName(), List.of("ROLE_USER"));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        return new AuthResponse(token, user.getUsername(), user.getFullName(), roles);
    }
}
