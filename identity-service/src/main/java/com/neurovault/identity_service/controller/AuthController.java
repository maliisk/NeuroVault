package com.neurovault.identity_service.controller;

import com.neurovault.identity_service.dto.AuthRequest;
import com.neurovault.identity_service.dto.RegisterRequest;
import com.neurovault.identity_service.entity.User;
import com.neurovault.identity_service.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("ROLE_USER");

        String responseMessage = authService.register(user);

        return ResponseEntity.ok(responseMessage);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest authRequest){

        String token = authService.login(authRequest.getEmail(), authRequest.getPassword());

        return ResponseEntity.ok(token);
    }
}
