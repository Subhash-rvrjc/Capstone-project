package com.busticket.service;

import com.busticket.model.Route;
import com.busticket.repository.RouteRepository;
import com.busticket.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class RouteServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private RouteService routeService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createRoute_throws_whenDuplicate() {
        Route route = new Route();
        route.setSource("A");
        route.setDestination("B");
        when(routeRepository.existsBySourceAndDestination("A", "B")).thenReturn(true);
        assertThrows(RuntimeException.class, () -> routeService.createRoute(route));
    }
}


