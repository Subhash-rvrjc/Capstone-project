package com.busticket.repository;

import com.busticket.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingCode(String bookingCode);
    
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.trip t " +
           "LEFT JOIN FETCH t.route r " +
           "LEFT JOIN FETCH t.bus bus " +
           "LEFT JOIN FETCH b.bookingSeats bs " +
           "LEFT JOIN FETCH bs.seat s " +
           "WHERE b.id = :id")
    Optional<Booking> findDetailedById(@Param("id") Long id);

    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.trip t " +
           "LEFT JOIN FETCH t.route r " +
           "LEFT JOIN FETCH t.bus bus " +
           "LEFT JOIN FETCH b.bookingSeats bs " +
           "LEFT JOIN FETCH bs.seat s " +
           "ORDER BY b.bookingDate DESC")
    List<Booking> findRecentBookings(Pageable pageable);
    
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.trip t " +
           "LEFT JOIN FETCH t.route r " +
           "LEFT JOIN FETCH t.bus bus " +
           "LEFT JOIN FETCH b.bookingSeats bs " +
           "LEFT JOIN FETCH bs.seat s " +
           "WHERE b.user.id = :userId ORDER BY b.bookingDate DESC")
    List<Booking> findByUserId(@Param("userId") Long userId);
    
    List<Booking> findByTripId(Long tripId);
    
    List<Booking> findByStatus(Booking.BookingStatus status);
    
    List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    List<Booking> findBookingsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.trip.tripDate = :tripDate")
    List<Booking> findBookingsByTripDate(@Param("tripDate") LocalDate tripDate);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status AND b.bookingDate >= :startDate")
    long countBookingsByStatusAndDate(@Param("status") Booking.BookingStatus status, 
                                     @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND b.bookingDate >= :startDate AND b.bookingDate <= :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.trip.route.source = :source " +
           "AND b.trip.route.destination = :destination AND b.status = 'CONFIRMED'")
    List<Booking> findBookingsByRoute(@Param("source") String source, 
                                     @Param("destination") String destination);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate < :expiryDate AND b.status = 'PENDING'")
    List<Booking> findExpiredPendingBookings(@Param("expiryDate") LocalDateTime expiryDate);
}
