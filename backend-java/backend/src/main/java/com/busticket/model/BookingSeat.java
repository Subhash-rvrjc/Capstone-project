package com.busticket.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"booking", "hibernateLazyInitializer", "handler"})
@Table(name = "booking_seats")
public class BookingSeat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Booking is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @NotNull(message = "Seat is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;
    
    @Column(name = "passenger_name")
    private String passengerName;
    
    @Column(name = "passenger_age")
    private Integer passengerAge;
    
    @Column(name = "passenger_gender")
    @Enumerated(EnumType.STRING)
    private Gender passengerGender;
    
    @Column(name = "seat_fare", precision = 10, scale = 2)
    private BigDecimal seatFare;
    
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
    public BookingSeat() {}
    
    public BookingSeat(Booking booking, Seat seat, String passengerName, 
                      Integer passengerAge, Gender passengerGender, BigDecimal seatFare) {
        this.booking = booking;
        this.seat = seat;
        this.passengerName = passengerName;
        this.passengerAge = passengerAge;
        this.passengerGender = passengerGender;
        this.seatFare = seatFare;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Booking getBooking() {
        return booking;
    }
    
    public void setBooking(Booking booking) {
        this.booking = booking;
    }
    
    public Seat getSeat() {
        return seat;
    }
    
    public void setSeat(Seat seat) {
        this.seat = seat;
    }
    
    public String getPassengerName() {
        return passengerName;
    }
    
    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }
    
    public Integer getPassengerAge() {
        return passengerAge;
    }
    
    public void setPassengerAge(Integer passengerAge) {
        this.passengerAge = passengerAge;
    }
    
    public Gender getPassengerGender() {
        return passengerGender;
    }
    
    public void setPassengerGender(Gender passengerGender) {
        this.passengerGender = passengerGender;
    }
    
    public BigDecimal getSeatFare() {
        return seatFare;
    }
    
    public void setSeatFare(BigDecimal seatFare) {
        this.seatFare = seatFare;
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
    
    public enum Gender {
        MALE("Male"),
        FEMALE("Female"),
        OTHER("Other");
        
        private final String displayName;
        
        Gender(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
