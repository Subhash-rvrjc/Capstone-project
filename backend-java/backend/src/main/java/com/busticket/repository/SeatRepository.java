package com.busticket.repository;

import com.busticket.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    
    List<Seat> findByTripId(Long tripId);
    
    List<Seat> findByTripIdAndSeatNumberIn(Long tripId, List<Integer> seatNumbers);
    
    List<Seat> findByTripIdAndIsBookedFalse(Long tripId);
    
    List<Seat> findByTripIdAndIsHoldTrue(Long tripId);
    
    @Query("SELECT s FROM Seat s WHERE s.trip.id = :tripId AND s.isBooked = false AND (s.isHold = false OR s.holdExpiry < :now)")
    List<Seat> findAvailableSeats(@Param("tripId") Long tripId, @Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.trip.id = :tripId AND s.isBooked = true")
    long countBookedSeatsByTripId(@Param("tripId") Long tripId);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.trip.id = :tripId AND s.isHold = true AND s.holdExpiry > :now")
    long countHeldSeatsByTripId(@Param("tripId") Long tripId, @Param("now") LocalDateTime now);
    
    List<Seat> findByTripIdAndIsBookedTrue(Long tripId);
    
    @Query("SELECT COUNT(s) FROM Seat s WHERE s.trip.id = :tripId AND s.isBooked = false AND (s.isHold = false OR s.holdExpiry < :now)")
    long countAvailableSeatsByTripId(@Param("tripId") Long tripId, @Param("now") LocalDateTime now);
}
