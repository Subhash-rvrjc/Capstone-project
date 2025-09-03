package com.busticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, NET_BANKING, UPI, WALLET, CASH
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    private String transactionId;
    
    private String paymentGateway;
    
    // Constructors
    public PaymentRequest() {}
    
    public PaymentRequest(Long bookingId, String paymentMethod, BigDecimal amount) {
        this.bookingId = bookingId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }
    
    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getPaymentGateway() {
        return paymentGateway;
    }
    
    public void setPaymentGateway(String paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
}
