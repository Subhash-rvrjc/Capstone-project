package com.busticket.repository;

import com.busticket.model.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    
    List<Route> findByIsActiveTrue();
    
    List<Route> findBySourceContainingIgnoreCase(String source);
    
    List<Route> findByDestinationContainingIgnoreCase(String destination);
    
    List<Route> findBySourceContainingIgnoreCaseAndDestinationContainingIgnoreCase(String source, String destination);
    
    boolean existsBySourceAndDestination(String source, String destination);
    
    @Query("SELECT r FROM Route r WHERE r.routeCode = :routeCode")
    Route findByRouteCode(@Param("routeCode") String routeCode);
    
    @Query("SELECT r FROM Route r WHERE r.distance BETWEEN :minDistance AND :maxDistance")
    List<Route> findByDistanceRange(@Param("minDistance") Double minDistance, @Param("maxDistance") Double maxDistance);
    
    @Query("SELECT r FROM Route r WHERE r.duration BETWEEN :minDuration AND :maxDuration")
    List<Route> findByDurationRange(@Param("minDuration") Integer minDuration, @Param("maxDuration") Integer maxDuration);
}
