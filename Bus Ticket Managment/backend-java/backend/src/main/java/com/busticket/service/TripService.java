package com.busticket.service;

import com.busticket.dto.TripSearchRequest;
import com.busticket.model.Seat;
import com.busticket.model.Trip;
import com.busticket.repository.TripRepository;
import com.busticket.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private SeatService seatService;

    @Autowired
    private SeatRepository seatRepository;

    public List<Trip> searchTrips(TripSearchRequest request) {
        return tripRepository.findBySourceAndDestinationAndTripDate(
            request.getSource(),
            request.getDestination(),
            request.getTravelDate()
        );
    }
    
    public Map<String, Object> getTripSeats(Long tripId) {
        return seatService.getTripSeats(tripId);
    }
    
    public Trip createTrip(Trip trip) {
        Trip saved = tripRepository.save(trip);
        generateSeatsForTrip(saved);
        return saved;
    }
    
    public Trip updateTrip(Long id, Trip trip) {
        trip.setId(id);
        return tripRepository.save(trip);
    }
    
    public List<Trip> getTripsByRoute(Long routeId) {
        return tripRepository.findByRouteId(routeId);
    }
    
    public List<Trip> getTripsByBus(Long busId) {
        return tripRepository.findByBusId(busId);
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    public Trip saveTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }

    public List<Trip> getTripsByDate(LocalDate date) {
        return tripRepository.findByTripDate(date);
    }

    public Trip initSeats(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        if (seatRepository.findByTripId(tripId).isEmpty()) {
            generateSeatsForTrip(trip);
        }
        return trip;
    }

    private void generateSeatsForTrip(Trip trip) {
        if (trip.getBus() == null || trip.getBus().getTotalSeats() == null) {
            return;
        }
        int totalSeats = trip.getBus().getTotalSeats();
        java.util.ArrayList<Seat> newSeats = new java.util.ArrayList<>();
        for (int i = 1; i <= totalSeats; i++) {
            Seat seat = new Seat();
            seat.setTrip(trip);
            seat.setSeatNumber(i);
            seat.setSeatType((i % 2 == 1) ? Seat.SeatType.WINDOW : Seat.SeatType.AISLE);
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            seat.setBooked(false);
            seat.setHold(false);
            seat.setHoldExpiry(null);
            newSeats.add(seat);
        }
        seatRepository.saveAll(newSeats);
        if (trip.getAvailableSeats() == null) {
            trip.setAvailableSeats(totalSeats);
            tripRepository.save(trip);
        }
    }
}
