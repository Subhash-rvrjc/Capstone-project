package com.busticket.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "tickets")
public class Ticket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Booking is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Column(name = "ticket_number", unique = true)
    private String ticketNumber; // Auto-generated ticket number
    
    @Column(name = "qr_code", columnDefinition = "TEXT")
    private String qrCode; // Base64 encoded QR code image
    
    @Column(name = "qr_code_data")
    private String qrCodeData; // Data encoded in QR code
    
    @Column(name = "pdf_path")
    private String pdfPath; // Path to generated PDF ticket
    
    @Column(name = "is_valid")
    private boolean isValid = true;
    
    @Column(name = "validated_at")
    private LocalDateTime validatedAt;
    
    @Column(name = "validation_count")
    private Integer validationCount = 0;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (ticketNumber == null) {
            ticketNumber = generateTicketNumber();
        }
        if (qrCodeData == null) {
            qrCodeData = generateQRCodeData();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateTicketNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return "TKT" + timestamp.substring(timestamp.length() - 10) + random;
    }
    
    private String generateQRCodeData() {
        if (booking != null && ticketNumber != null) {
            return String.format("TICKET:%s|BOOKING:%s|USER:%s", 
                               ticketNumber, 
                               booking.getBookingCode(), 
                               booking.getUser().getId());
        }
        return null;
    }
    
    // Constructors
    public Ticket() {}
    
    public Ticket(Booking booking) {
        this.booking = booking;
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
    
    public String getTicketNumber() {
        return ticketNumber;
    }
    
    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
    
    public String getQrCodeData() {
        return qrCodeData;
    }
    
    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }
    
    public String getPdfPath() {
        return pdfPath;
    }
    
    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }
    
    public boolean isValid() {
        return isValid;
    }
    
    public void setValid(boolean valid) {
        isValid = valid;
    }
    
    public LocalDateTime getValidatedAt() {
        return validatedAt;
    }
    
    public void setValidatedAt(LocalDateTime validatedAt) {
        this.validatedAt = validatedAt;
    }
    
    public Integer getValidationCount() {
        return validationCount;
    }
    
    public void setValidationCount(Integer validationCount) {
        this.validationCount = validationCount;
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
}
