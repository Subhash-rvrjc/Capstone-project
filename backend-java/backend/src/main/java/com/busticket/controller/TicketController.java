package com.busticket.controller;

import com.busticket.model.Ticket;
import com.busticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@Tag(name = "Ticket Management", description = "Ticket generation and management APIs")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get ticket details", description = "Get ticket details with QR code")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long ticketId) {
        Ticket ticket = ticketService.getTicketById(ticketId);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get ticket by booking", description = "Get ticket for a specific booking")
    public ResponseEntity<Ticket> getTicketByBooking(@PathVariable Long bookingId) {
        Ticket ticket = ticketService.getTicketByBookingId(bookingId);
        return ResponseEntity.ok(ticket);
    }

    @PostMapping("/generate/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Generate ticket", description = "Generate e-ticket for a confirmed booking")
    public ResponseEntity<Ticket> generateTicket(@PathVariable Long bookingId) {
        Ticket ticket = ticketService.generateTicket(bookingId);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/validate/{ticketNumber}")
    @Operation(summary = "Validate ticket", description = "Validate ticket by ticket number")
    public ResponseEntity<Ticket> validateTicket(@PathVariable String ticketNumber) {
        Ticket ticket = ticketService.validateTicket(ticketNumber);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all tickets", description = "Get all tickets (Admin only)")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }
}
