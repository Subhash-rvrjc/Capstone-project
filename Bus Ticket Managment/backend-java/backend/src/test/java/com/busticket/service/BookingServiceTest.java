package com.busticket.service;

import com.busticket.dto.BookingRequest;
import com.busticket.model.*;
import com.busticket.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private SeatRepository seatRepository;
    @Mock private TripRepository tripRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private BookingService bookingService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void holdSeats_throws_whenNoSeatsProvided() {
        BookingRequest req = new BookingRequest();
        assertThrows(RuntimeException.class, () -> bookingService.holdSeats(req));
    }

    @Test
    void holdSeats_succeeds_whenValid() {
        BookingRequest req = new BookingRequest();
        req.setTripId(1L);
        req.setUserId(2L);
        req.setSeatNumbers(java.util.List.of(1, 2));
        req.setTotalAmount(java.math.BigDecimal.valueOf(100));

        Trip trip = new Trip();
        Bus bus = new Bus();
        bus.setTotalSeats(40);
        trip.setBus(bus);

        when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        when(userRepository.findById(2L)).thenReturn(Optional.of(new User()));
        when(seatRepository.findByTripId(1L)).thenReturn(List.of(new Seat())); // not empty so skip generation
        Seat s1 = new Seat(); s1.setSeatNumber(1); s1.setTrip(trip); s1.setBooked(false); s1.setHold(false);
        Seat s2 = new Seat(); s2.setSeatNumber(2); s2.setTrip(trip); s2.setBooked(false); s2.setHold(false);
        when(seatRepository.findByTripIdAndSeatNumberIn(1L, req.getSeatNumbers())).thenReturn(List.of(s1, s2));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        // ensure maxSeatsPerBooking > 0 for test
        try {
            java.lang.reflect.Field f = BookingService.class.getDeclaredField("maxSeatsPerBooking");
            f.setAccessible(true);
            f.setInt(bookingService, 10);
        } catch (Exception ignored) {}

        Booking booking = bookingService.holdSeats(req);
        assertThat(booking).isNotNull();
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void confirmBooking_throws_whenNotPending() {
        Booking booking = new Booking();
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        assertThrows(RuntimeException.class, () -> bookingService.confirmBooking(1L));
    }
}


