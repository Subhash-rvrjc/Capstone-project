package com.busticket.service;

import com.busticket.model.Booking;
import com.busticket.model.Ticket;
import com.busticket.repository.BookingRepository;
import com.busticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Ticket getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket getTicketByBookingId(Long bookingId) {
        return ticketRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Ticket not found for booking"));
    }

    public Ticket generateTicket(Long bookingId) {
        // Validate booking exists and is confirmed
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking is not confirmed");
        }

        // Check if ticket already exists
        if (ticketRepository.findByBookingId(bookingId).isPresent()) {
            throw new RuntimeException("Ticket already exists for this booking");
        }

        // Generate ticket
        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setTicketNumber(generateTicketNumber());
        ticket.setQrCodeData(generateQRCodeData(booking));
        ticket.setValid(true);
        ticket.setValidatedAt(null);
        ticket.setValidationCount(0);

        return ticketRepository.save(ticket);
    }

    public Ticket validateTicket(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!ticket.isValid()) {
            throw new RuntimeException("Ticket is not valid");
        }

        // Update validation count and time
        ticket.setValidationCount(ticket.getValidationCount() + 1);
        ticket.setValidatedAt(LocalDateTime.now());

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    private String generateTicketNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 8);
        return "TKT" + timestamp.substring(timestamp.length() - 8) + random.toUpperCase();
    }

    private String generateQRCodeData(Booking booking) {
        // Generate QR code data with booking information
        return String.format("Booking:%s,Trip:%s,User:%s,Date:%s", 
                booking.getBookingCode(),
                booking.getTrip().getTripCode(),
                booking.getUser().getEmail(),
                booking.getTrip().getTripDate());
    }
}
