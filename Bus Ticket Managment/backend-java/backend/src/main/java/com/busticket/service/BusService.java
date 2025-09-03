package com.busticket.service;

import com.busticket.model.Bus;
import com.busticket.repository.BusRepository;
import com.busticket.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BusService {

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private TripRepository tripRepository;

    public Bus createBus(Bus bus) {
        // Validate that bus number doesn't already exist
        if (busRepository.existsByBusNumber(bus.getBusNumber())) {
            throw new RuntimeException("Bus with number " + bus.getBusNumber() + " already exists");
        }
        return busRepository.save(bus);
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Optional<Bus> getBusById(Long busId) {
        return busRepository.findById(busId);
    }

    public Bus updateBus(Long busId, Bus busDetails) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        // Check if bus number is being changed and if it already exists
        if (!bus.getBusNumber().equals(busDetails.getBusNumber()) && 
            busRepository.existsByBusNumber(busDetails.getBusNumber())) {
            throw new RuntimeException("Bus with number " + busDetails.getBusNumber() + " already exists");
        }

        // Update bus details
        bus.setBusNumber(busDetails.getBusNumber());
        bus.setBusType(busDetails.getBusType());
        bus.setOperatorName(busDetails.getOperatorName());
        bus.setTotalSeats(busDetails.getTotalSeats());
        bus.setSeatLayout(busDetails.getSeatLayout());
        bus.setAmenities(busDetails.getAmenities());
        bus.setActive(busDetails.isActive());

        return busRepository.save(bus);
    }

    public void deleteBus(Long busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        // Check if bus has any trips
        if (!tripRepository.findByBusId(busId).isEmpty()) {
            throw new RuntimeException("Cannot delete bus with existing trips");
        }

        busRepository.delete(bus);
    }

    public List<Bus> getActiveBuses() {
        return busRepository.findByIsActiveTrue();
    }

    public List<Bus> getBusesByType(String busType) {
        return busRepository.findByBusType(Bus.BusType.valueOf(busType.toUpperCase()));
    }

    public List<Bus> getTripsByBus(Long busId) {
        // This method should return trips, but since it's in BusService, 
        // we'll delegate to TripRepository
        return tripRepository.findByBusId(busId).stream()
                .map(trip -> trip.getBus())
                .distinct()
                .toList();
    }
}
