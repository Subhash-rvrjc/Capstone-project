package com.busticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class BookingRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Trip ID is required")
    private Long tripId;
    
    @NotNull(message = "Seat numbers are required")
    @Size(min = 1, message = "At least one seat must be selected")
    private List<Integer> seatNumbers;
    
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;
    
    private String specialRequests;
    
    // Constructors
    public BookingRequest() {}
    
    public BookingRequest(Long userId, Long tripId, List<Integer> seatNumbers, BigDecimal totalAmount) {
        this.userId = userId;
        this.tripId = tripId;
        this.seatNumbers = seatNumbers;
        this.totalAmount = totalAmount;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getTripId() {
        return tripId;
    }
    
    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }
    
    public List<Integer> getSeatNumbers() {
        return seatNumbers;
    }
    
    public void setSeatNumbers(List<Integer> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
}
