package com.busticket.service;

import com.busticket.model.Seat;
import com.busticket.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    public Map<String, Object> getTripSeats(Long tripId) {
        List<Seat> seats = seatRepository.findByTripId(tripId);
        
        Map<String, Object> seatInfo = new HashMap<>();
        seatInfo.put("tripId", tripId);
        seatInfo.put("totalSeats", seats.size());
        
        long availableSeats = seats.stream()
                .filter(seat -> !seat.isBooked() && (!seat.isHold() || 
                        (seat.getHoldExpiry() != null && seat.getHoldExpiry().isBefore(LocalDateTime.now()))))
                .count();
        
        long bookedSeats = seats.stream().filter(Seat::isBooked).count();
        long heldSeats = seats.stream().filter(seat -> seat.isHold() && 
                (seat.getHoldExpiry() == null || seat.getHoldExpiry().isAfter(LocalDateTime.now()))).count();
        
        seatInfo.put("availableSeats", availableSeats);
        seatInfo.put("bookedSeats", bookedSeats);
        seatInfo.put("heldSeats", heldSeats);
        seatInfo.put("seats", seats);
        
        return seatInfo;
    }

    public List<Seat> getAvailableSeats(Long tripId) {
        return seatRepository.findAvailableSeats(tripId, LocalDateTime.now());
    }

    public List<Seat> getBookedSeats(Long tripId) {
        return seatRepository.findByTripIdAndIsBookedTrue(tripId);
    }

    public List<Seat> getHeldSeats(Long tripId) {
        return seatRepository.findByTripIdAndIsHoldTrue(tripId);
    }

    public long getAvailableSeatCount(Long tripId) {
        return seatRepository.countAvailableSeatsByTripId(tripId, LocalDateTime.now());
    }

    public long getBookedSeatCount(Long tripId) {
        return seatRepository.countBookedSeatsByTripId(tripId);
    }

    public long getHeldSeatCount(Long tripId) {
        return seatRepository.countHeldSeatsByTripId(tripId, LocalDateTime.now());
    }
}
