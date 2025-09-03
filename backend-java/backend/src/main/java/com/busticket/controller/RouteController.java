package com.busticket.controller;

import com.busticket.model.Route;
import com.busticket.service.RouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/routes")
@Tag(name = "Route Management", description = "Route management APIs")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create route", description = "Create a new route (Admin only)")
    public ResponseEntity<Route> createRoute(@Valid @RequestBody Route route) {
        Route createdRoute = routeService.createRoute(route);
        return ResponseEntity.ok(createdRoute);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all routes", description = "Get all routes (Admin only)")
    public ResponseEntity<List<Route>> getAllRoutes() {
        List<Route> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get route by ID", description = "Get route details by ID (Admin only)")
    public ResponseEntity<Route> getRouteById(@PathVariable Long routeId) {
        Optional<Route> routeOptional = routeService.getRouteById(routeId);
        if (routeOptional.isPresent()) {
            return ResponseEntity.ok(routeOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update route", description = "Update route details (Admin only)")
    public ResponseEntity<Route> updateRoute(@PathVariable Long routeId, @Valid @RequestBody Route routeDetails) {
        Route updatedRoute = routeService.updateRoute(routeId, routeDetails);
        return ResponseEntity.ok(updatedRoute);
    }

    @DeleteMapping("/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete route", description = "Delete a route (Admin only)")
    public ResponseEntity<String> deleteRoute(@PathVariable Long routeId) {
        routeService.deleteRoute(routeId);
        return ResponseEntity.ok("Route deleted successfully");
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get active routes", description = "Get all active routes (Admin only)")
    public ResponseEntity<List<Route>> getActiveRoutes() {
        List<Route> routes = routeService.getActiveRoutes();
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search routes", description = "Search routes by source and destination (Admin only)")
    public ResponseEntity<List<Route>> searchRoutes(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination) {
        List<Route> routes = routeService.searchRoutes(source, destination);
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/{routeId}/trips")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get trips by route", description = "Get all trips for a specific route (Admin only)")
    public ResponseEntity<?> getTripsByRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(routeService.getTripsByRoute(routeId));
    }
}
