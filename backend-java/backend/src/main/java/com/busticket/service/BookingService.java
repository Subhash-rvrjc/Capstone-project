package com.busticket.service;

import com.busticket.dto.BookingRequest;
import com.busticket.model.Booking;
import com.busticket.model.Seat;
import com.busticket.model.BookingSeat;
import com.busticket.model.Trip;
import com.busticket.model.User;
import com.busticket.repository.BookingRepository;
import com.busticket.repository.SeatRepository;
import com.busticket.repository.TripRepository;
import com.busticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${app.seat-hold-timeout:300000}")
    private long seatHoldTimeoutMs;

    @Value("${app.max-seats-per-booking:10}")
    private int maxSeatsPerBooking;

    public Booking holdSeats(BookingRequest request) {
        if (request.getSeatNumbers() == null || request.getSeatNumbers().isEmpty()) {
            throw new RuntimeException("At least one seat must be selected");
        }
        if (request.getSeatNumbers().size() > maxSeatsPerBooking) {
            throw new RuntimeException("Cannot book more than " + maxSeatsPerBooking + " seats per booking");
        }
        // Validate trip exists
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        // Validate user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Ensure seats exist for this trip (legacy trips may not have generated seats)
        List<Seat> existingSeats = seatRepository.findByTripId(request.getTripId());
        if (existingSeats.isEmpty()) {
            if (trip.getBus() == null || trip.getBus().getTotalSeats() == null) {
                throw new RuntimeException("Trip bus or totalSeats not configured");
            }
            int totalSeats = trip.getBus().getTotalSeats();
            java.util.ArrayList<Seat> newSeats = new java.util.ArrayList<>();
            for (int i = 1; i <= totalSeats; i++) {
                Seat seat = new Seat();
                seat.setTrip(trip);
                seat.setSeatNumber(i);
                seat.setSeatType((i % 2 == 1) ? Seat.SeatType.WINDOW : Seat.SeatType.AISLE);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setBooked(false);
                seat.setHold(false);
                seat.setHoldExpiry(null);
                newSeats.add(seat);
            }
            seatRepository.saveAll(newSeats);
        }

        // Load requested seats
        List<Seat> seats = seatRepository.findByTripIdAndSeatNumberIn(request.getTripId(), request.getSeatNumbers());
        if (seats.size() != request.getSeatNumbers().size()) {
            throw new RuntimeException("One or more selected seats do not exist for this trip");
        }

        LocalDateTime now = LocalDateTime.now();
        for (Seat seat : seats) {
            if (seat.isHold() && (seat.getHoldExpiry() == null || seat.getHoldExpiry().isBefore(now))) {
                seat.setHold(false);
                seat.setHoldExpiry(null);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seatRepository.save(seat);
            }
        }

        for (Seat seat : seats) {
            boolean holdActive = seat.isHold() && seat.getHoldExpiry() != null && seat.getHoldExpiry().isAfter(now);
            if (seat.isBooked() || holdActive) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is not available");
            }
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setTrip(trip);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setPassengerCount(request.getSeatNumbers().size());

        // Hold seats and link to this booking
        java.time.Duration holdDuration = java.time.Duration.ofMillis(seatHoldTimeoutMs);
        for (Seat seat : seats) {
            seat.setHold(true);
            seat.setHoldExpiry(now.plus(holdDuration));
            seat.setStatus(Seat.SeatStatus.HOLD);
            seatRepository.save(seat);

            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(booking);
            bookingSeat.setSeat(seat);
            booking.getBookingSeats().add(bookingSeat);
        }

        return bookingRepository.save(booking);
    }

    public Booking confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }

        // Confirm only seats associated with this booking
        for (BookingSeat bs : booking.getBookingSeats()) {
            Seat seat = bs.getSeat();
            if (seat.isHold()) {
                seat.setBooked(true);
                seat.setHold(false);
                seat.setHoldExpiry(null);
                seat.setStatus(Seat.SeatStatus.BOOKED);
                seatRepository.save(seat);
            }
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking is not confirmed");
        }

        // Release only seats of this booking
        for (BookingSeat bs : booking.getBookingSeats()) {
            Seat seat = bs.getSeat();
            if (seat.isBooked()) {
                seat.setBooked(false);
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seatRepository.save(seat);
            }
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
