package com.busticket.service;

import com.busticket.repository.BookingRepository;
import com.busticket.repository.PaymentRepository;
import com.busticket.repository.TripRepository;
import com.busticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.busticket.model.Trip;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getSalesReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get total revenue
        Double totalRevenue = paymentRepository.getTotalRevenueByDateRange(startDateTime, endDateTime);
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        // Get booking counts
        long totalBookings = bookingRepository.countBookingsByStatusAndDate(
                com.busticket.model.Booking.BookingStatus.CONFIRMED, startDateTime);
        report.put("totalBookings", totalBookings);
        
        // Get average booking value
        double avgBookingValue = totalRevenue != null && totalRevenue > 0 ? 
                totalRevenue / totalBookings : 0.0;
        report.put("averageBookingValue", avgBookingValue);
        
        // Get date range
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }

    public Map<String, Object> getOccupancyReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Get total trips in date range
        List<Trip> tripsInRange = tripRepository.findTripsByDateRange(startDate, endDate);
        long totalTrips = tripsInRange.size();
        report.put("totalTrips", totalTrips);
        
        // Get total bookings
        LocalDateTime startDateTime = startDate.atStartOfDay();
        long totalBookings = bookingRepository.countBookingsByStatusAndDate(
                com.busticket.model.Booking.BookingStatus.CONFIRMED, startDateTime);
        report.put("totalBookings", totalBookings);
        
        // Calculate occupancy rate (simplified)
        double occupancyRate = totalTrips > 0 ? (double) totalBookings / totalTrips * 100 : 0.0;
        report.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
        
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }

    public Map<String, Object> getRoutePerformanceReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Get route-wise bookings
        // This would need a more complex query, but for now we'll return basic structure
        report.put("topRoutes", "Route performance data");
        report.put("startDate", startDate);
        report.put("endDate", endDate);
        
        return report;
    }

    public Map<String, Object> getDailySettlementReport(LocalDate date) {
        Map<String, Object> report = new HashMap<>();
        
        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.atTime(23, 59, 59);
        
        // Get daily revenue
        Double dailyRevenue = paymentRepository.getTotalRevenueByDateRange(startDateTime, endDateTime);
        report.put("dailyRevenue", dailyRevenue != null ? dailyRevenue : 0.0);
        
        // Get daily bookings
        long dailyBookings = bookingRepository.countBookingsByStatusAndDate(
                com.busticket.model.Booking.BookingStatus.CONFIRMED, startDateTime);
        report.put("dailyBookings", dailyBookings);
        
        report.put("date", date);
        
        return report;
    }

    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Totals
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalTrips", tripRepository.count());
        dashboard.put("totalBookings", bookingRepository.count());

        // Revenue last 30 days
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();
        Double last30Revenue = paymentRepository.getTotalRevenueByDateRange(from, to);
        dashboard.put("totalRevenue", last30Revenue != null ? last30Revenue : 0.0);

        return dashboard;
    }

    public byte[] generateReportPdf(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> sales = getSalesReport(startDate, endDate);
        Map<String, Object> occupancy = getOccupancyReport(startDate, endDate);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document doc = new Document(pdf);

        // Title
        doc.add(new Paragraph("Bus Ticket Reservation - Report")
                .setTextAlignment(TextAlignment.CENTER)
                .setBold()
                .setFontSize(16));
        doc.add(new Paragraph(String.format("Period: %s to %s", startDate, endDate))
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(11));
        doc.add(new Paragraph("\n"));

        // Sales Summary table
        doc.add(new Paragraph("Sales Summary").setBold().setFontSize(13));
        Table salesTable = new Table(new float[]{3, 2}).useAllAvailableWidth();
        salesTable.addCell("Total Revenue");
        salesTable.addCell(String.valueOf(sales.getOrDefault("totalRevenue", 0)));
        salesTable.addCell("Total Bookings");
        salesTable.addCell(String.valueOf(sales.getOrDefault("totalBookings", 0)));
        salesTable.addCell("Average Booking Value");
        salesTable.addCell(String.valueOf(sales.getOrDefault("averageBookingValue", 0)));
        doc.add(salesTable);
        doc.add(new Paragraph("\n"));

        // Occupancy Summary table
        doc.add(new Paragraph("Occupancy Summary").setBold().setFontSize(13));
        Table occTable = new Table(new float[]{3, 2}).useAllAvailableWidth();
        occTable.addCell("Total Trips");
        occTable.addCell(String.valueOf(occupancy.getOrDefault("totalTrips", 0)));
        occTable.addCell("Total Bookings");
        occTable.addCell(String.valueOf(occupancy.getOrDefault("totalBookings", 0)));
        occTable.addCell("Occupancy Rate (%)");
        occTable.addCell(String.valueOf(occupancy.getOrDefault("occupancyRate", 0)));
        doc.add(occTable);

        doc.close();
        return baos.toByteArray();
    }
}
