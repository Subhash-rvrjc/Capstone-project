package com.busticket.repository;

import com.busticket.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByBookingId(Long bookingId);
    
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    List<Payment> findByPaymentMethod(Payment.PaymentMethod method);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentDate >= :startDate AND p.paymentDate <= :endDate")
    List<Payment> findPaymentsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' " +
           "AND p.paymentDate >= :startDate AND p.paymentDate <= :endDate")
    Double getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status " +
           "AND p.paymentDate >= :startDate")
    long countPaymentsByStatusAndDate(@Param("status") Payment.PaymentStatus status, 
                                     @Param("startDate") LocalDateTime startDate);
}
