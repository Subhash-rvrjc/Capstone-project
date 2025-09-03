package com.busticket.service;

import com.busticket.dto.AuthRequest;
import com.busticket.dto.AuthResponse;
import com.busticket.model.User;
import com.busticket.repository.UserRepository;
import com.busticket.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void login_returnsAuthResponse_whenCredentialsAreValid() {
        AuthRequest request = new AuthRequest("user@example.com", "password123");
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken("user@example.com")).thenReturn("refresh-token");

        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(tokenProvider.getExpirationTime()).thenReturn(3600L);

        AuthResponse response = userService.login(request);

        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getExpiresIn()).isEqualTo(3600L);
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void register_throws_whenEmailExists() {
        AuthRequest request = new AuthRequest();
        request.setEmail("exists@example.com");
        request.setPassword("password123");
        when(userRepository.existsByEmail("exists@example.com")).thenReturn(true);
        assertThrows(RuntimeException.class, () -> userService.register(request));
    }

    @Test
    void register_savesUser_andReturnsTokens() {
        AuthRequest request = new AuthRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setName("New User");
        request.setPhone("1234567890");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");

        User saved = new User();
        saved.setId(1L);
        saved.setEmail("new@example.com");
        when(userRepository.save(ArgumentMatchers.any(User.class))).thenReturn(saved);
        when(tokenProvider.generateTokenFromUsername("new@example.com")).thenReturn("access-token");
        when(tokenProvider.generateRefreshToken("new@example.com")).thenReturn("refresh-token");
        when(tokenProvider.getExpirationTime()).thenReturn(3600L);

        AuthResponse response = userService.register(request);
        assertThat(response.getToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
    }
}


