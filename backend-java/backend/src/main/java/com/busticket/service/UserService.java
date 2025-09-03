package com.busticket.service;

import com.busticket.dto.AuthRequest;
import com.busticket.dto.AuthResponse;
import com.busticket.model.User;
import com.busticket.repository.UserRepository;
import com.busticket.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @org.springframework.beans.factory.annotation.Value("${app.admin.invite-code:}")
    private String adminInviteCode;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated");
        }
        
        return user;
    }
    
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        String token = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        return new AuthResponse(token, refreshToken, tokenProvider.getExpirationTime(), user);
    }
    
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Default role is CUSTOMER
        User.UserRole roleToAssign = User.UserRole.CUSTOMER;
        // Allow ADMIN only if a valid invite code is configured and provided
        if (request.getInviteCode() != null && !request.getInviteCode().isBlank()) {
            String trimmed = request.getInviteCode().trim();
            if (adminInviteCode != null && !adminInviteCode.isBlank() && trimmed.equals(adminInviteCode)) {
                roleToAssign = User.UserRole.ADMIN;
            }
        }
        user.setRole(roleToAssign);
        
        User savedUser = userRepository.save(user);
        
        String token = tokenProvider.generateTokenFromUsername(savedUser.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail());
        
        return new AuthResponse(token, refreshToken, tokenProvider.getExpirationTime(), savedUser);
    }
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public User updateUser(Long userId, User userDetails) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setName(userDetails.getName());
        user.setPhone(userDetails.getPhone());
        user.setActive(userDetails.isActive());
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(false);
        userRepository.save(user);
    }
    
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> getActiveUsers() {
        return userRepository.findByIsActive(true);
    }
    
    public long getTotalUsers() {
        return userRepository.count();
    }
    
    public long getUsersByRoleCount(User.UserRole role) {
        return userRepository.countByRole(role);
    }
    
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false;
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

    public User updateUserRole(Long userId, User.UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
