package com.busticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RoleUpdateRequest {
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "(?i)^(ADMIN|CUSTOMER)$", message = "Role must be ADMIN or CUSTOMER")
    private String role;

    public RoleUpdateRequest() {}

    public RoleUpdateRequest(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}


