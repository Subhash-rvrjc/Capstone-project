package com.busticket.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@JsonIgnoreProperties({"seats", "bookings", "hibernateLazyInitializer", "handler"})
@Table(name = "trips")
public class Trip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Bus is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;
    
    @NotNull(message = "Route is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;
    
    @NotNull(message = "Trip date is required")
    @Column(name = "trip_date", nullable = false)
    private LocalDate tripDate;
    
    @NotNull(message = "Departure time is required")
    @Column(name = "departure_time", nullable = false)
    private LocalTime departureTime;
    
    @NotNull(message = "Arrival time is required")
    @Column(name = "arrival_time", nullable = false)
    private LocalTime arrivalTime;
    
    @NotNull(message = "Fare is required")
    @Positive(message = "Fare must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal fare;
    
    @Column(name = "available_seats")
    private Integer availableSeats;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status", nullable = false)
    private TripStatus status = TripStatus.SCHEDULED;
    
    @Column(name = "trip_code", unique = true)
    private String tripCode; // Auto-generated trip code
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Seat> seats = new ArrayList<>();
    
    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (tripCode == null) {
            tripCode = generateTripCode();
        }
        if (availableSeats == null && bus != null) {
            availableSeats = bus.getTotalSeats();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateTripCode() {
        String dateStr = tripDate.toString().replace("-", "");
        String timeStr = departureTime.toString().replace(":", "");
        return "TRIP-" + dateStr + "-" + timeStr + "-" + 
               String.format("%03d", (int)(Math.random() * 1000));
    }
    
    // Constructors
    public Trip() {}
    
    public Trip(Bus bus, Route route, LocalDate tripDate, LocalTime departureTime, 
                LocalTime arrivalTime, BigDecimal fare) {
        this.bus = bus;
        this.route = route;
        this.tripDate = tripDate;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.fare = fare;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Bus getBus() {
        return bus;
    }
    
    public void setBus(Bus bus) {
        this.bus = bus;
    }
    
    public Route getRoute() {
        return route;
    }
    
    public void setRoute(Route route) {
        this.route = route;
    }
    
    public LocalDate getTripDate() {
        return tripDate;
    }
    
    public void setTripDate(LocalDate tripDate) {
        this.tripDate = tripDate;
    }
    
    public LocalTime getDepartureTime() {
        return departureTime;
    }
    
    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }
    
    public LocalTime getArrivalTime() {
        return arrivalTime;
    }
    
    public void setArrivalTime(LocalTime arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
    
    public BigDecimal getFare() {
        return fare;
    }
    
    public void setFare(BigDecimal fare) {
        this.fare = fare;
    }
    
    public Integer getAvailableSeats() {
        return availableSeats;
    }
    
    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }
    
    public TripStatus getStatus() {
        return status;
    }
    
    public void setStatus(TripStatus status) {
        this.status = status;
    }
    
    public String getTripCode() {
        return tripCode;
    }
    
    public void setTripCode(String tripCode) {
        this.tripCode = tripCode;
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
    
    public List<Seat> getSeats() {
        return seats;
    }
    
    public void setSeats(List<Seat> seats) {
        this.seats = seats;
    }
    
    public List<Booking> getBookings() {
        return bookings;
    }
    
    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }
    
    public enum TripStatus {
        SCHEDULED("Scheduled"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        DELAYED("Delayed");
        
        private final String displayName;
        
        TripStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}
