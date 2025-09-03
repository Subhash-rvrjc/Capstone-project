package com.busticket.controller;

import com.busticket.dto.PaymentRequest;
import com.busticket.model.Payment;
import com.busticket.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@Tag(name = "Payment Management", description = "Payment processing and management APIs")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Process payment", description = "Process payment for a booking")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.processPayment(request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get payment by booking", description = "Get payment details for a specific booking")
    public ResponseEntity<Payment> getPaymentByBooking(@PathVariable Long bookingId) {
        Payment payment = paymentService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Process refund", description = "Process refund for a payment (Admin only)")
    public ResponseEntity<Payment> processRefund(@PathVariable Long paymentId, 
                                               @RequestParam(required = false) String reason) {
        Payment payment = paymentService.processRefund(paymentId, reason);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get payment details", description = "Get detailed payment information (Admin only)")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long paymentId) {
        Payment payment = paymentService.getPaymentById(paymentId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all payments", description = "Get all payments (Admin only)")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }
}
