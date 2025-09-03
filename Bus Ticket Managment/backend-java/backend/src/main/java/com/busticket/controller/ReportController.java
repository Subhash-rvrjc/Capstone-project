package com.busticket.controller;

import com.busticket.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@Tag(name = "Reports & Dashboards", description = "Reporting and analytics APIs")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Sales summary", description = "Get sales summary with revenue and booking data")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate fromDate = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate toDate = endDate != null ? endDate : LocalDate.now();
        
        Map<String, Object> report = reportService.getSalesReport(fromDate, toDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Occupancy report", description = "Get seat occupancy and utilization data")
    public ResponseEntity<Map<String, Object>> getOccupancyReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate fromDate = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate toDate = endDate != null ? endDate : LocalDate.now();
        
        Map<String, Object> report = reportService.getOccupancyReport(fromDate, toDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/route-performance")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Route performance", description = "Get route-wise performance metrics")
    public ResponseEntity<Map<String, Object>> getRoutePerformanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        LocalDate fromDate = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate toDate = endDate != null ? endDate : LocalDate.now();
        
        Map<String, Object> report = reportService.getRoutePerformanceReport(fromDate, toDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/daily-settlement")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Daily settlement", description = "Get daily settlement and revenue data")
    public ResponseEntity<Map<String, Object>> getDailySettlementReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        Map<String, Object> report = reportService.getDailySettlementReport(date);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dashboard data", description = "Get comprehensive dashboard data")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> dashboard = reportService.getDashboardData();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping(value = "/download", produces = "application/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download report", description = "Generate and download PDF report for the date range")
    public ResponseEntity<byte[]> downloadReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        byte[] pdf = reportService.generateReportPdf(startDate, endDate);
        return ResponseEntity.ok()
                .header("Content-Disposition", String.format("attachment; filename=report_%s_%s.pdf", startDate, endDate))
                .body(pdf);
    }
}
