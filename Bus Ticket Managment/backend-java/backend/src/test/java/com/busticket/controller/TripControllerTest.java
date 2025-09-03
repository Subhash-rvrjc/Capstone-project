package com.busticket.controller;

import com.busticket.dto.TripSearchRequest;
import com.busticket.model.Trip;
import com.busticket.service.TripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.busticket.security.JwtAuthenticationFilter;
import com.busticket.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(controllers = TripController.class)
@AutoConfigureMockMvc(addFilters = false)
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TripService tripService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void searchTrips_returnsList() throws Exception {
        Mockito.when(tripService.searchTrips(any(TripSearchRequest.class)))
                .thenReturn(Collections.emptyList());

        TripSearchRequest req = new TripSearchRequest();
        req.setSource("A");
        req.setDestination("B");
        req.setTravelDate(LocalDate.now());

        mockMvc.perform(post("/trips/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}


