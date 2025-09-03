package com.busticket.service;

import com.busticket.model.Bus;
import com.busticket.repository.BusRepository;
import com.busticket.repository.TripRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class BusServiceTest {

    @Mock
    private BusRepository busRepository;
    @Mock
    private TripRepository tripRepository;

    @InjectMocks
    private BusService busService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createBus_succeeds_whenBusNumberUnique() {
        Bus bus = new Bus();
        bus.setBusNumber("ABC123");
        when(busRepository.existsByBusNumber("ABC123")).thenReturn(false);
        when(busRepository.save(bus)).thenReturn(bus);
        Bus saved = busService.createBus(bus);
        assertThat(saved).isNotNull();
        verify(busRepository).save(bus);
    }

    @Test
    void createBus_throws_whenDuplicateBusNumber() {
        Bus bus = new Bus();
        bus.setBusNumber("DUP123");
        when(busRepository.existsByBusNumber("DUP123")).thenReturn(true);
        assertThrows(RuntimeException.class, () -> busService.createBus(bus));
    }
}


