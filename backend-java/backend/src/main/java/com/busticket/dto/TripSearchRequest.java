package com.busticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class TripSearchRequest {
    
    @NotBlank(message = "Source is required")
    private String source;
    
    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotNull(message = "Travel date is required")
    private LocalDate travelDate;
    
    private Integer passengers = 1;
    private String busType; // Optional filter
    private String sortBy = "departureTime"; // departureTime, fare, duration
    private String sortOrder = "ASC"; // ASC, DESC
    
    // Constructors
    public TripSearchRequest() {}
    
    public TripSearchRequest(String source, String destination, LocalDate travelDate) {
        this.source = source;
        this.destination = destination;
        this.travelDate = travelDate;
    }
    
    public TripSearchRequest(String source, String destination, LocalDate travelDate, Integer passengers) {
        this.source = source;
        this.destination = destination;
        this.travelDate = travelDate;
        this.passengers = passengers;
    }
    
    // Getters and Setters
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
    
    public LocalDate getTravelDate() {
        return travelDate;
    }
    
    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }
    
    public Integer getPassengers() {
        return passengers;
    }
    
    public void setPassengers(Integer passengers) {
        this.passengers = passengers;
    }
    
    public String getBusType() {
        return busType;
    }
    
    public void setBusType(String busType) {
        this.busType = busType;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
    
    public String getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }
}
