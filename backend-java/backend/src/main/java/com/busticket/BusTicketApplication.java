package com.busticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application class for Bus Ticket Reservation System
 */
@SpringBootApplication
@EnableScheduling
public class BusTicketApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusTicketApplication.class, args);
    }
}
