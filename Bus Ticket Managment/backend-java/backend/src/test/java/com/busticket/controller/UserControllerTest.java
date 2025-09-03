package com.busticket.controller;

import com.busticket.dto.RoleUpdateRequest;
import com.busticket.model.User;
import com.busticket.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.busticket.security.JwtAuthenticationFilter;
import com.busticket.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void updateUserRole_returnsOk() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setRole(User.UserRole.CUSTOMER);
        Mockito.when(userService.getUserById(1L)).thenReturn(Optional.of(user));

        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRole("ADMIN");

        mockMvc.perform(patch("/users/1/role")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        Mockito.verify(userService).updateUserRole(1L, User.UserRole.ADMIN);
    }
}


