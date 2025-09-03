package com.busticket.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"trips", "hibernateLazyInitializer", "handler"})
@Table(name = "routes")
public class Route {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Source is required")
    @Column(nullable = false)
    private String source;
    
    @NotBlank(message = "Destination is required")
    @Column(nullable = false)
    private String destination;
    
    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    @Column(nullable = false)
    private Double distance; // in kilometers
    
    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    @Column(nullable = false)
    private Integer duration; // in minutes
    
    @Column(name = "route_code", unique = true)
    private String routeCode; // Auto-generated route code
    
    @Column(name = "stops", columnDefinition = "TEXT")
    private String stops; // JSON array of intermediate stops
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Trip> trips = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (routeCode == null) {
            routeCode = generateRouteCode();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateRouteCode() {
        return source.substring(0, Math.min(3, source.length())).toUpperCase() + 
               "-" + 
               destination.substring(0, Math.min(3, destination.length())).toUpperCase() + 
               "-" + 
               String.format("%03d", (int)(Math.random() * 1000));
    }
    
    // Constructors
    public Route() {}
    
    public Route(String source, String destination, Double distance, Integer duration) {
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.duration = duration;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
    
    public String getDestination() {
        return destination;
    }
    
    public void setDestination(String destination) {
        this.destination = destination;
    }
    
    public Double getDistance() {
        return distance;
    }
    
    public void setDistance(Double distance) {
        this.distance = distance;
    }
    
    public Integer getDuration() {
        return duration;
    }
    
    public void setDuration(Integer duration) {
        this.duration = duration;
    }
    
    public String getRouteCode() {
        return routeCode;
    }
    
    public void setRouteCode(String routeCode) {
        this.routeCode = routeCode;
    }
    
    public String getStops() {
        return stops;
    }
    
    public void setStops(String stops) {
        this.stops = stops;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<Trip> getTrips() {
        return trips;
    }
    
    public void setTrips(List<Trip> trips) {
        this.trips = trips;
    }
}
