import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI, bookingAPI, ticketAPI } from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, booking, tripInfo } = location.state || {};
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'UPI',
    transactionId: '',
    paymentGateway: 'INTERNAL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Process payment while booking is in PENDING
      const paymentRequest = {
        bookingId: bookingId,
        paymentMethod: paymentData.paymentMethod,
        amount: booking.totalAmount,
        transactionId: paymentData.transactionId || `TXN${Date.now()}`,
        paymentGateway: paymentData.paymentGateway
      };

      const paymentResponse = await paymentAPI.processPayment(paymentRequest);
      
      if (paymentResponse.data) {
        // Booking should now be CONFIRMED by backend payment flow
        try { await ticketAPI.generateTicket(bookingId); } catch (_) {}

        // Refresh booking from backend and cache for My Bookings immediate display
        try {
          const refreshed = await bookingAPI.getById(bookingId);
          const normalizedBooking = {
            ...(refreshed?.data || {}),
            totalAmount: (refreshed?.data?.totalAmount ?? booking.totalAmount)
          };
          let cachedUserId = null;
          try {
            const u = JSON.parse(localStorage.getItem('user') || 'null');
            cachedUserId = u?.id || null;
          } catch (_) {}
          const cache = {
            userId: (booking?.user?.id) || cachedUserId,
            booking: normalizedBooking,
            bookingId: bookingId,
            createdAt: Date.now()
          };
          try { localStorage.setItem('recentBooking', JSON.stringify(cache)); } catch (_) {}
        } catch (_) {}
        setSuccess('Payment successful! Booking confirmed. Generating ticket...');
        setTimeout(() => {
          window.open(`/tickets/${bookingId}`, '_blank');
          navigate('/my-bookings', { state: { paymentSuccess: true, bookingId } });
        }, 2000);
      }
    } catch (err) {
      const apiData = err.response?.data;
      let message = apiData?.message || 'Payment failed. Please try again.';
      const apiErrors = apiData?.errors;
      if (apiErrors) {
        if (Array.isArray(apiErrors) && apiErrors.length > 0) {
          const first = apiErrors[0];
          if (typeof first === 'string') {
            message = first;
          } else if (first && typeof first === 'object') {
            message = first.message || JSON.stringify(first);
          }
        } else if (typeof apiErrors === 'object') {
          const parts = Object.values(apiErrors)
            .map(v => (typeof v === 'string' ? v : (v && typeof v === 'object' ? v.message : '')))
            .filter(Boolean);
          if (parts.length > 0) {
            message = parts.join(', ');
          }
        }
      }
      const msg = String(message || '');
      // If already confirmed (double-submit), try to generate ticket and proceed
      if (/already|confirmed|not in pending/i.test(msg)) {
        try {
          await ticketAPI.generateTicket(bookingId);
          try {
            const refreshed = await bookingAPI.getById(bookingId);
            const normalizedBooking = {
              ...(refreshed?.data || {}),
              totalAmount: (refreshed?.data?.totalAmount ?? booking.totalAmount)
            };
            let cachedUserId = null;
            try {
              const u = JSON.parse(localStorage.getItem('user') || 'null');
              cachedUserId = u?.id || null;
            } catch (_) {}
            const cache = {
              userId: (booking?.user?.id) || cachedUserId,
              booking: normalizedBooking,
              bookingId: bookingId,
              createdAt: Date.now()
            };
            try { localStorage.setItem('recentBooking', JSON.stringify(cache)); } catch (_) {}
          } catch (_) {}
          setSuccess('Payment recorded earlier. Generating ticket...');
          setError('');
          setTimeout(() => {
            window.open(`/tickets/${bookingId}`, '_blank');
            navigate('/my-bookings', { state: { paymentSuccess: true, bookingId } });
          }, 1500);
          return;
        } catch (_) {}
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!bookingId || !booking || !tripInfo) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" style={{ borderRadius: '10px' }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          No booking found. Please complete a booking first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h3 className="mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Payment Details
              </h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px' }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mb-4" style={{ borderRadius: '10px' }}>
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </Alert>
              )}
              
              <Form onSubmit={handlePayment}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Payment Method</Form.Label>
                  <Form.Select
                    name="paymentMethod"
                    value={paymentData.paymentMethod}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="UPI">UPI</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="NET_BANKING">Net Banking</option>
                    <option value="WALLET">Wallet</option>
                    <option value="CASH">Cash</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Transaction ID (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="transactionId"
                    value={paymentData.transactionId}
                    onChange={handleChange}
                    style={{ borderRadius: '10px' }}
                    placeholder="Enter transaction ID if available"
                  />
                  <Form.Text className="text-muted">
                    Leave empty for cash payments or if not available
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Payment Gateway</Form.Label>
                  <Form.Select
                    name="paymentGateway"
                    value={paymentData.paymentGateway}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '10px' }}
                  >
                    <option value="INTERNAL">Internal</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="RAZORPAY">Razorpay</option>
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="success" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                  style={{ 
                    borderRadius: '25px', 
                    padding: '12px 30px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    border: 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock me-2"></i>
                      Pay ₹{booking.totalAmount}
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-receipt me-2"></i>
                Payment Summary
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3 p-3" style={{ 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px',
                border: '1px solid #e9ecef'
              }}>
                <div className="text-center mb-3">
                  <i className="fas fa-bus fa-2x text-primary"></i>
                </div>
                <div className="text-center">
                  <h6 className="fw-bold">{tripInfo.route?.source} → {tripInfo.route?.destination}</h6>
                  <p className="text-muted mb-2">{formatDate(tripInfo.tripDate)}</p>
                  <Badge bg="info" className="mb-2">{formatTime(tripInfo.departureTime)}</Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Booking ID:</span>
                  <span className="fw-bold">{booking.bookingCode}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Bus Number:</span>
                  <span className="fw-bold">{tripInfo.bus?.busNumber || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Seats:</span>
                  <span className="fw-bold">{booking.passengerCount}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Seat Numbers:</span>
                  <span className="fw-bold">
                    {booking.bookingSeats?.map(bs => bs.seat?.seatNumber).join(', ')}
                  </span>
                </div>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fs-5 fw-bold">Total Amount:</span>
                <span className="fs-4 fw-bold text-success">₹{booking.totalAmount}</span>
              </div>
              
              <div className="alert alert-info" style={{ borderRadius: '10px' }}>
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  Your seats are held for 5 minutes. Complete payment to confirm booking.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Payment;
