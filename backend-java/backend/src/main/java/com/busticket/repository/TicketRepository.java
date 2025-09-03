package com.busticket.repository;

import com.busticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    @Query("SELECT DISTINCT tk FROM Ticket tk " +
           "LEFT JOIN FETCH tk.booking b " +
           "LEFT JOIN FETCH b.trip t " +
           "LEFT JOIN FETCH t.route r " +
           "LEFT JOIN FETCH t.bus bus " +
           "WHERE b.id = :bookingId")
    Optional<Ticket> findByBookingId(@Param("bookingId") Long bookingId);
    
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    
    List<Ticket> findByIsValidTrue();
    
    List<Ticket> findByIsValidFalse();
    
    @Query("SELECT t FROM Ticket t WHERE t.createdAt >= :startDate AND t.createdAt <= :endDate")
    List<Ticket> findTicketsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                       @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.isValid = true AND t.createdAt >= :startDate")
    long countValidTicketsByDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT t FROM Ticket t WHERE t.validationCount > 0 ORDER BY t.validationCount DESC")
    List<Ticket> findMostValidatedTickets();
}
