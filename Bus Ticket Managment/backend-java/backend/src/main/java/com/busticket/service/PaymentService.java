package com.busticket.service;

import com.busticket.dto.PaymentRequest;
import com.busticket.model.Booking;
import com.busticket.model.Payment;
import com.busticket.repository.BookingRepository;
import com.busticket.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Payment processPayment(PaymentRequest request) {
        // Validate booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }

        // Create payment
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setTransactionId(request.getTransactionId() != null ? 
                request.getTransactionId() : generateTransactionId());
        payment.setPaymentGateway(request.getPaymentGateway() != null ? 
                request.getPaymentGateway() : "INTERNAL");
        payment.setPaymentDate(LocalDateTime.now());

        // Save payment
        Payment savedPayment = paymentRepository.save(payment);

        // Update booking status to confirmed
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return savedPayment;
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking"));
    }

    public Payment processRefund(Long paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment is not successful");
        }

        // Process refund
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        payment.setRefundAmount(payment.getAmount());
        payment.setRefundDate(LocalDateTime.now());
        payment.setRefundReason(reason);

        // Update booking status to cancelled
        Booking booking = payment.getBooking();
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setRefundAmount(payment.getAmount());
        bookingRepository.save(booking);

        return paymentRepository.save(payment);
    }

    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
    }
}
