package com.busticket.repository;

import com.busticket.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    Optional<Trip> findByTripCode(String tripCode);
    
    List<Trip> findByTripDate(LocalDate tripDate);
    
    List<Trip> findByTripDateAndStatus(LocalDate tripDate, Trip.TripStatus status);
    
    List<Trip> findByBusId(Long busId);
    
    List<Trip> findByRouteId(Long routeId);
    
    @Query("SELECT DISTINCT t FROM Trip t " +
           "LEFT JOIN FETCH t.bus b " +
           "LEFT JOIN FETCH t.route r " +
           "WHERE r.source = :source AND r.destination = :destination " +
           "AND t.tripDate = :travelDate AND t.status = 'SCHEDULED' AND t.isActive = true " +
           "ORDER BY t.departureTime ASC")
    List<Trip> searchTrips(@Param("source") String source, 
                          @Param("destination") String destination, 
                          @Param("travelDate") LocalDate travelDate);
    
    @Query("SELECT DISTINCT t FROM Trip t " +
           "LEFT JOIN FETCH t.bus b " +
           "LEFT JOIN FETCH t.route r " +
           "WHERE r.source = :source AND r.destination = :destination " +
           "AND t.tripDate = :travelDate AND b.busType = :busType AND t.status = 'SCHEDULED' " +
           "AND t.isActive = true ORDER BY t.departureTime ASC")
    List<Trip> searchTripsByBusType(@Param("source") String source, 
                                   @Param("destination") String destination, 
                                   @Param("travelDate") LocalDate travelDate,
                                   @Param("busType") String busType);
    
    @Query("SELECT t FROM Trip t WHERE t.tripDate >= :startDate AND t.tripDate <= :endDate " +
           "AND t.status = 'SCHEDULED' AND t.isActive = true")
    List<Trip> findTripsByDateRange(@Param("startDate") LocalDate startDate, 
                                   @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(t) FROM Trip t WHERE t.tripDate = :date AND t.status = 'SCHEDULED'")
    long countScheduledTripsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT t FROM Trip t WHERE t.departureTime BETWEEN :startTime AND :endTime " +
           "AND t.tripDate = :date AND t.status = 'SCHEDULED'")
    List<Trip> findTripsByTimeRange(@Param("date") LocalDate date,
                                   @Param("startTime") LocalTime startTime,
                                   @Param("endTime") LocalTime endTime);
    
    // Method for TripService
    @Query("SELECT DISTINCT t FROM Trip t " +
           "LEFT JOIN FETCH t.bus b " +
           "LEFT JOIN FETCH t.route r " +
           "WHERE r.source = :source AND r.destination = :destination " +
           "AND t.tripDate = :tripDate AND t.status = 'SCHEDULED' AND t.isActive = true " +
           "ORDER BY t.departureTime ASC")
    List<Trip> findBySourceAndDestinationAndTripDate(@Param("source") String source, 
                                                    @Param("destination") String destination, 
                                                    @Param("tripDate") LocalDate tripDate);
}
