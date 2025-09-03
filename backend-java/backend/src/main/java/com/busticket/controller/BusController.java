package com.busticket.controller;

import com.busticket.model.Bus;
import com.busticket.service.BusService;
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
@RequestMapping("/buses")
@Tag(name = "Bus Management", description = "Bus management APIs")
@CrossOrigin(origins = "*")
public class BusController {

    @Autowired
    private BusService busService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create bus", description = "Create a new bus (Admin only)")
    public ResponseEntity<Bus> createBus(@Valid @RequestBody Bus bus) {
        Bus createdBus = busService.createBus(bus);
        return ResponseEntity.ok(createdBus);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all buses", description = "Get all buses (Admin only)")
    public ResponseEntity<List<Bus>> getAllBuses() {
        List<Bus> buses = busService.getAllBuses();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bus by ID", description = "Get bus details by ID (Admin only)")
    public ResponseEntity<Bus> getBusById(@PathVariable Long busId) {
        Optional<Bus> busOptional = busService.getBusById(busId);
        if (busOptional.isPresent()) {
            return ResponseEntity.ok(busOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update bus", description = "Update bus details (Admin only)")
    public ResponseEntity<Bus> updateBus(@PathVariable Long busId, @Valid @RequestBody Bus busDetails) {
        Bus updatedBus = busService.updateBus(busId, busDetails);
        return ResponseEntity.ok(updatedBus);
    }

    @DeleteMapping("/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete bus", description = "Delete a bus (Admin only)")
    public ResponseEntity<String> deleteBus(@PathVariable Long busId) {
        busService.deleteBus(busId);
        return ResponseEntity.ok("Bus deleted successfully");
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get active buses", description = "Get all active buses (Admin only)")
    public ResponseEntity<List<Bus>> getActiveBuses() {
        List<Bus> buses = busService.getActiveBuses();
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/type/{busType}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get buses by type", description = "Get buses by bus type (Admin only)")
    public ResponseEntity<List<Bus>> getBusesByType(@PathVariable String busType) {
        List<Bus> buses = busService.getBusesByType(busType);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{busId}/trips")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get trips by bus", description = "Get all trips for a specific bus (Admin only)")
    public ResponseEntity<?> getTripsByBus(@PathVariable Long busId) {
        return ResponseEntity.ok(busService.getTripsByBus(busId));
    }
}
