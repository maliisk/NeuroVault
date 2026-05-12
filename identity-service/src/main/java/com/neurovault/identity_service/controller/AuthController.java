package com.neurovault.identity_service.controller;

import com.neurovault.identity_service.dto.AuthRequest;
import com.neurovault.identity_service.dto.AuthResponse;
import com.neurovault.identity_service.dto.RegisterRequest;
import com.neurovault.identity_service.dto.UserUpdateRequest;
import com.neurovault.identity_service.entity.User;
import com.neurovault.identity_service.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("ROLE_USER");

        String token = authService.register(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest){
        String token = authService.login(authRequest.getEmail(), authRequest.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    public ResponseEntity<AuthResponse> updateProfile(@RequestBody UserUpdateRequest request, @RequestHeader("email") String email) {
        String newToken = authService.updateProfile(email, request);
        return ResponseEntity.ok(new AuthResponse(newToken));
    }
}