package com.busticket.repository;

import com.busticket.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    
    List<Bus> findByIsActiveTrue();
    
    List<Bus> findByBusType(Bus.BusType busType);
    
    List<Bus> findByOperatorNameContainingIgnoreCase(String operatorName);
    
    boolean existsByBusNumber(String busNumber);
    
    @Query("SELECT b FROM Bus b WHERE b.busNumber = :busNumber")
    Bus findByBusNumber(@Param("busNumber") String busNumber);
    
    @Query("SELECT b FROM Bus b WHERE b.totalSeats >= :minSeats AND b.totalSeats <= :maxSeats")
    List<Bus> findBySeatRange(@Param("minSeats") Integer minSeats, @Param("maxSeats") Integer maxSeats);
    
    @Query("SELECT b FROM Bus b WHERE b.operatorName = :operatorName AND b.isActive = true")
    List<Bus> findActiveBusesByOperator(@Param("operatorName") String operatorName);
}
