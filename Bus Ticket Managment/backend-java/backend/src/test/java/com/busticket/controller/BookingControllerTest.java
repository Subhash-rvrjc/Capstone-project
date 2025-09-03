package com.busticket.controller;

import com.busticket.dto.BookingRequest;
import com.busticket.model.Booking;
import com.busticket.service.BookingService;
import com.busticket.service.UserService;
import com.busticket.security.JwtAuthenticationFilter;
import com.busticket.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private BookingService bookingService;
    @MockBean private UserService userService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private JwtTokenProvider jwtTokenProvider;

    @Test
    void holdSeats_returnsOk() throws Exception {
        Mockito.when(bookingService.holdSeats(any(BookingRequest.class)))
                .thenReturn(new Booking());
        BookingRequest req = new BookingRequest();
        req.setTripId(1L);
        req.setUserId(1L);
        req.setSeatNumbers(java.util.List.of(1,2));
        req.setTotalAmount(java.math.BigDecimal.valueOf(100));

        mockMvc.perform(post("/bookings/hold")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}


