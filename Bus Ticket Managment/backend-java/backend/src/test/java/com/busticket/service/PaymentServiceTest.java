package com.busticket.service;

import com.busticket.dto.PaymentRequest;
import com.busticket.model.Booking;
import com.busticket.model.Payment;
import com.busticket.repository.BookingRepository;
import com.busticket.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private BookingRepository bookingRepository;

    @InjectMocks private PaymentService paymentService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void processPayment_throws_whenBookingNotPending() {
        Booking booking = new Booking();
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        PaymentRequest req = new PaymentRequest();
        req.setBookingId(1L);
        req.setAmount(java.math.BigDecimal.valueOf(100));
        req.setPaymentMethod("CREDIT_CARD");
        assertThrows(RuntimeException.class, () -> paymentService.processPayment(req));
    }

    @Test
    void processPayment_succeeds_whenPending() {
        Booking booking = new Booking();
        booking.setStatus(Booking.BookingStatus.PENDING);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentRequest req = new PaymentRequest();
        req.setBookingId(1L);
        req.setAmount(java.math.BigDecimal.valueOf(100));
        req.setPaymentMethod("CREDIT_CARD");

        Payment payment = paymentService.processPayment(req);
        assertThat(payment).isNotNull();
        verify(bookingRepository).save(any(Booking.class));
    }
}


