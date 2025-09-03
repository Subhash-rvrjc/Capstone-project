package com.busticket.service;

import com.busticket.model.Route;
import com.busticket.repository.RouteRepository;
import com.busticket.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private TripRepository tripRepository;

    public Route createRoute(Route route) {
        // Validate that route doesn't already exist
        if (routeRepository.existsBySourceAndDestination(route.getSource(), route.getDestination())) {
            throw new RuntimeException("Route already exists between " + route.getSource() + " and " + route.getDestination());
        }
        return routeRepository.save(route);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Optional<Route> getRouteById(Long routeId) {
        return routeRepository.findById(routeId);
    }

    public Route updateRoute(Long routeId, Route routeDetails) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));

        // Update route details
        route.setSource(routeDetails.getSource());
        route.setDestination(routeDetails.getDestination());
        route.setDistance(routeDetails.getDistance());
        route.setDuration(routeDetails.getDuration());
        route.setStops(routeDetails.getStops());
        route.setActive(routeDetails.isActive());

        return routeRepository.save(route);
    }

    public void deleteRoute(Long routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("Route not found"));

        // Check if route has any trips
        if (!tripRepository.findByRouteId(routeId).isEmpty()) {
            throw new RuntimeException("Cannot delete route with existing trips");
        }

        routeRepository.delete(route);
    }

    public List<Route> getActiveRoutes() {
        return routeRepository.findByIsActiveTrue();
    }

    public List<Route> searchRoutes(String source, String destination) {
        if (source != null && destination != null) {
            return routeRepository.findBySourceContainingIgnoreCaseAndDestinationContainingIgnoreCase(source, destination);
        } else if (source != null) {
            return routeRepository.findBySourceContainingIgnoreCase(source);
        } else if (destination != null) {
            return routeRepository.findByDestinationContainingIgnoreCase(destination);
        } else {
            return routeRepository.findAll();
        }
    }

    public List<Route> getTripsByRoute(Long routeId) {
        // This method should return trips, but since it's in RouteService, 
        // we'll delegate to TripRepository
        return tripRepository.findByRouteId(routeId).stream()
                .map(trip -> trip.getRoute())
                .distinct()
                .toList();
    }
}
