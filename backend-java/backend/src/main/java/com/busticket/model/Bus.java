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
@Table(name = "buses")
public class Bus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Bus number is required")
    @Column(name = "bus_number", unique = true, nullable = false)
    private String busNumber;
    
    @NotNull(message = "Bus type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "bus_type", nullable = false)
    private BusType busType;
    
    @NotBlank(message = "Operator name is required")
    @Column(name = "operator_name", nullable = false)
    private String operatorName;
    
    @NotNull(message = "Total seats is required")
    @Positive(message = "Total seats must be positive")
    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;
    
    @Column(name = "seat_layout", columnDefinition = "TEXT")
    private String seatLayout; // JSON string representing seat layout
    
    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities; // JSON string of available amenities
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Trip> trips = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Bus() {}
    
    public Bus(String busNumber, BusType busType, String operatorName, Integer totalSeats) {
        this.busNumber = busNumber;
        this.busType = busType;
        this.operatorName = operatorName;
        this.totalSeats = totalSeats;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBusNumber() {
        return busNumber;
    }
    
    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }
    
    public BusType getBusType() {
        return busType;
    }
    
    public void setBusType(BusType busType) {
        this.busType = busType;
    }
    
    public String getOperatorName() {
        return operatorName;
    }
    
    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }
    
    public Integer getTotalSeats() {
        return totalSeats;
    }
    
    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }
    
    public String getSeatLayout() {
        return seatLayout;
    }
    
    public void setSeatLayout(String seatLayout) {
        this.seatLayout = seatLayout;
    }
    
    public String getAmenities() {
        return amenities;
    }
    
    public void setAmenities(String amenities) {
        this.amenities = amenities;
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
    
    public enum BusType {
        AC_SLEEPER("AC Sleeper"),
        NON_AC_SLEEPER("Non-AC Sleeper"),
        AC_SEATER("AC Seater"),
        NON_AC_SEATER("Non-AC Seater"),
        LUXURY("Luxury");
        
        private final String displayName;
        
        BusType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
