package com.busticket.controller;

import com.busticket.dto.TripSearchRequest;
import com.busticket.model.Trip;
import com.busticket.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/trips")
@Tag(name = "Trip Management", description = "Trip management and search APIs")
@CrossOrigin(origins = "*")
public class TripController {
    
    @Autowired
    private TripService tripService;
    
    @PostMapping("/search")
    @Operation(summary = "Search trips", description = "Search available trips by source, destination, and date")
    public ResponseEntity<List<Trip>> searchTrips(@Valid @RequestBody TripSearchRequest request) {
        List<Trip> trips = tripService.searchTrips(request);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/{tripId}/seats")
    @Operation(summary = "Get trip seats", description = "Get seat availability for a specific trip")
    public ResponseEntity<?> getTripSeats(@PathVariable Long tripId) {
        return ResponseEntity.ok(tripService.getTripSeats(tripId));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create trip", description = "Create a new trip (Admin only)")
    public ResponseEntity<Trip> createTrip(@Valid @RequestBody Trip trip) {
        Trip createdTrip = tripService.createTrip(trip);
        return ResponseEntity.ok(createdTrip);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all trips", description = "Get all trips (Admin only)")
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/{tripId}")
    @Operation(summary = "Get trip by ID", description = "Get trip details by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Trip details",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Trip.class))),
        @ApiResponse(responseCode = "404", description = "Trip not found")
    })
    public ResponseEntity<Trip> getTripById(@PathVariable Long tripId) {
        Optional<Trip> tripOptional = tripService.getTripById(tripId);
        if (tripOptional.isPresent()) {
            return ResponseEntity.ok(tripOptional.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{tripId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update trip", description = "Update trip details (Admin only)")
    public ResponseEntity<Trip> updateTrip(@PathVariable Long tripId, @Valid @RequestBody Trip tripDetails) {
        Trip updatedTrip = tripService.updateTrip(tripId, tripDetails);
        return ResponseEntity.ok(updatedTrip);
    }
    
    @DeleteMapping("/{tripId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete trip", description = "Delete a trip (Admin only)")
    public ResponseEntity<String> deleteTrip(@PathVariable Long tripId) {
        tripService.deleteTrip(tripId);
        return ResponseEntity.ok("Trip deleted successfully");
    }
    
    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get trips by date", description = "Get all trips for a specific date (Admin only)")
    public ResponseEntity<List<Trip>> getTripsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Trip> trips = tripService.getTripsByDate(date);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/route/{routeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get trips by route", description = "Get all trips for a specific route (Admin only)")
    public ResponseEntity<List<Trip>> getTripsByRoute(@PathVariable Long routeId) {
        List<Trip> trips = tripService.getTripsByRoute(routeId);
        return ResponseEntity.ok(trips);
    }
    
    @GetMapping("/bus/{busId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get trips by bus", description = "Get all trips for a specific bus (Admin only)")
    public ResponseEntity<List<Trip>> getTripsByBus(@PathVariable Long busId) {
        List<Trip> trips = tripService.getTripsByBus(busId);
        return ResponseEntity.ok(trips);
    }
}
