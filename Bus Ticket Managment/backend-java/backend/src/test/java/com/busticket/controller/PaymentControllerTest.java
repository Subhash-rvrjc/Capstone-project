package com.busticket.controller;

import com.busticket.dto.PaymentRequest;
import com.busticket.model.Payment;
import com.busticket.security.JwtAuthenticationFilter;
import com.busticket.security.JwtTokenProvider;
import com.busticket.service.PaymentService;
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

@WebMvcTest(controllers = PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private PaymentService paymentService;
    @MockBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean private JwtTokenProvider jwtTokenProvider;

    @Test
    void processPayment_returnsOk() throws Exception {
        Mockito.when(paymentService.processPayment(any(PaymentRequest.class)))
                .thenReturn(new Payment());

        PaymentRequest req = new PaymentRequest();
        req.setBookingId(1L);
        req.setAmount(java.math.BigDecimal.valueOf(100));
        req.setPaymentMethod("CREDIT_CARD");

        mockMvc.perform(post("/payments/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}


