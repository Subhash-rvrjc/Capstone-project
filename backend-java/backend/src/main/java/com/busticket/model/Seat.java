package com.busticket.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"trip", "hibernateLazyInitializer", "handler"})
@Table(name = "seats")
public class Seat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Trip is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;
    
    @NotNull(message = "Seat number is required")
    @Positive(message = "Seat number must be positive")
    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false)
    private SeatType seatType = SeatType.WINDOW;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_status", nullable = false)
    private SeatStatus status = SeatStatus.AVAILABLE;
    
    @Column(name = "is_booked")
    private boolean isBooked = false;
    
    @Column(name = "is_hold")
    private boolean isHold = false;
    
    @Column(name = "hold_expiry")
    private LocalDateTime holdExpiry;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
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
    public Seat() {}
    
    public Seat(Trip trip, Integer seatNumber, SeatType seatType) {
        this.trip = trip;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Trip getTrip() {
        return trip;
    }
    
    public void setTrip(Trip trip) {
        this.trip = trip;
    }
    
    public Integer getSeatNumber() {
        return seatNumber;
    }
    
    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }
    
    public SeatType getSeatType() {
        return seatType;
    }
    
    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
    }
    
    public SeatStatus getStatus() {
        return status;
    }
    
    public void setStatus(SeatStatus status) {
        this.status = status;
    }
    
    public boolean isBooked() {
        return isBooked;
    }
    
    public void setBooked(boolean booked) {
        isBooked = booked;
    }
    
    public boolean isHold() {
        return isHold;
    }
    
    public void setHold(boolean hold) {
        isHold = hold;
    }
    
    public LocalDateTime getHoldExpiry() {
        return holdExpiry;
    }
    
    public void setHoldExpiry(LocalDateTime holdExpiry) {
        this.holdExpiry = holdExpiry;
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
    
    public enum SeatType {
        WINDOW("Window"),
        AISLE("Aisle"),
        MIDDLE("Middle"),
        LOWER_BERTH("Lower Berth"),
        UPPER_BERTH("Upper Berth"),
        SIDE_LOWER("Side Lower"),
        SIDE_UPPER("Side Upper");
        
        private final String displayName;
        
        SeatType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum SeatStatus {
        AVAILABLE("Available"),
        BOOKED("Booked"),
        HOLD("Hold"),
        MAINTENANCE("Maintenance"),
        RESERVED("Reserved");
        
        private final String displayName;
        
        SeatStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
