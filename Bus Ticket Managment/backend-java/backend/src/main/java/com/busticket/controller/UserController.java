package com.busticket.controller;

import com.busticket.dto.RoleUpdateRequest;
import com.busticket.model.User;
import com.busticket.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management APIs")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Admin-only: Promote or demote a user's role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        User user = userService.getUserById(id).orElseThrow(() -> new RuntimeException("User not found"));
        User.UserRole newRole = User.UserRole.valueOf(request.getRole().toUpperCase());

        if (user.getRole() == newRole) {
            return ResponseEntity.noContent().build();
        }

        userService.updateUserRole(id, newRole);
        return ResponseEntity.ok("User role updated to " + newRole.name());
    }
}


