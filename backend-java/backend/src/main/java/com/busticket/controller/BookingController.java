package com.busticket.controller;

import com.busticket.dto.BookingRequest;
import com.busticket.model.Booking;
import com.busticket.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.busticket.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@Tag(name = "Booking Management", description = "Booking and seat management APIs")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @PostMapping("/hold")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Hold seats", description = "Place a temporary hold on selected seats for a trip")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Booking created",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Booking.class))),
        @ApiResponse(responseCode = "400", description = "Validation or seat availability error",
            content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<Booking> holdSeats(@Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.holdSeats(request);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Confirm booking", description = "Confirm a held booking after payment")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long bookingId) {
        Booking booking = bookingService.confirmBooking(bookingId);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Cancel booking", description = "Cancel a confirmed booking and process refund")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long bookingId, 
                                               @RequestParam(required = false) String reason) {
        Booking booking = bookingService.cancelBooking(bookingId, reason);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get user bookings", description = "Get all bookings for a specific user")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get my bookings", description = "Get all bookings for the currently authenticated user")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        String email = authentication.getName();
        Long userId = userService.getUserByEmail(email).orElseThrow(() -> new RuntimeException("User not found")).getId();
        List<Booking> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get booking details", description = "Get detailed information about a specific booking")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings", description = "Get all bookings (Admin only)")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
}
