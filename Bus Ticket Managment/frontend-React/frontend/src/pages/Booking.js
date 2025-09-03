import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, tripAPI } from '../services/api';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tripId, selectedSeats, tripInfo } = location.state || {};
  
  const [bookingData, setBookingData] = useState({
    phone: '',
    email: ''
  });
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [farePerSeat, setFarePerSeat] = useState(() => {
    const f = tripInfo?.fare ?? tripInfo?.price ?? tripInfo?.farePerSeat;
    return Number.isFinite(Number(f)) ? Number(f) : null;
  });

  // Prefill contact details from logged-in user
  useEffect(() => {
    if (user) {
      setBookingData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || user.mobile || ''
      }));
    }
  }, [user]);

  // Initialize passengers array based on selected seats
  useEffect(() => {
    const list = (selectedSeats || []).map((seatNumber, idx) => ({
      seatNumber,
      name: passengers[idx]?.name || '',
      age: passengers[idx]?.age || '',
      gender: passengers[idx]?.gender || ''
    }));
    setPassengers(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeats]);

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Ensure we have a valid fare per seat
  useEffect(() => {
    const current = tripInfo?.fare ?? tripInfo?.price ?? tripInfo?.farePerSeat;
    if (Number.isFinite(Number(current)) && Number(current) > 0) {
      setFarePerSeat(Number(current));
      return;
    }

    const fetchTrip = async () => {
      try {
        if (!tripId) return;
        const resp = await tripAPI.getById(tripId);
        const t = resp.data || {};
        const price = t.fare ?? t.price ?? t.farePerSeat ?? t.amountPerSeat;
        if (Number.isFinite(Number(price)) && Number(price) > 0) {
          setFarePerSeat(Number(price));
        }
      } catch (e) {
        // ignore; handled later in submit if still missing
      }
    };
    fetchTrip();
  }, [tripId, tripInfo]);

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const fare = Number(farePerSeat);
      if (!Number.isFinite(fare) || fare <= 0) {
        setError('Trip fare is invalid. Please go back and reselect the trip.');
        setLoading(false);
        return;
      }
      const totalAmount = Number((fare * selectedSeats.length).toFixed(2));
      
      // Validate passenger details
      if (!passengers || passengers.length !== selectedSeats.length) {
        setError('Please enter details for all selected passengers.');
        setLoading(false);
        return;
      }
      const normalizedPassengers = passengers.map(p => ({
        name: p.name,
        age: p.age ? parseInt(p.age) : null,
        gender: (p.gender || '').toString().toUpperCase(),
        seatNumber: p.seatNumber
      }));
      const missing = normalizedPassengers.some(p => !p.name || !p.age || !p.gender);
      if (missing) {
        setError('Please complete name, age, and gender for each passenger.');
        setLoading(false);
        return;
      }

      const bookingRequest = {
        userId: user.id,
        tripId: parseInt(tripId),
        seatNumbers: selectedSeats,
        totalAmount: totalAmount,
        amount: totalAmount,
        farePerSeat: fare,
        specialRequests: bookingData.specialRequests || '',
        passengerCount: selectedSeats.length,
        // Common variations different backends expect
        passengers: normalizedPassengers,
        passengerDetails: normalizedPassengers,
        contactPhone: bookingData.phone,
        contactEmail: bookingData.email
      };

      const response = await bookingAPI.holdSeats(bookingRequest);

      if (response.data) {
        const resp = response.data;
        const bookingObj = resp.booking || resp;
        const bookingIdResp = bookingObj.id || resp.bookingId || resp.id;
        const normalizedBooking = {
          ...bookingObj,
          totalAmount: bookingObj.totalAmount ?? bookingObj.amount ?? totalAmount,
          passengerCount: bookingObj.passengerCount ?? selectedSeats.length,
          bookingSeats: bookingObj.bookingSeats ?? bookingObj.seats ?? (selectedSeats || []).map(n => ({ seat: { seatNumber: n } }))
        };

        // Cache recent booking locally for My Bookings fallback display
        try {
          const cache = {
            userId: user.id,
            booking: normalizedBooking,
            bookingId: bookingIdResp,
            createdAt: Date.now()
          };
          localStorage.setItem('recentBooking', JSON.stringify(cache));
        } catch (_) {}

        setSuccess('Seats held successfully! Redirecting to payment...');
        setTimeout(() => {
          navigate('/payment', {
            state: {
              bookingId: bookingIdResp,
              booking: normalizedBooking,
              tripInfo: tripInfo
            }
          });
        }, 1200);
      }
    } catch (err) {
      const apiData = err.response?.data;
      let message = apiData?.message || 'Booking failed. Please try again.';
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
      setError(String(message));
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

  if (!tripId || !selectedSeats || !tripInfo) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" style={{ borderRadius: '10px' }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          No trip selected. Please search for a trip first.
        </Alert>
      </Container>
    );
  }

  const summaryFare = farePerSeat ?? tripInfo?.fare ?? tripInfo?.price ?? tripInfo?.farePerSeat ?? 0;
  const totalAmount = Number.isFinite(Number(summaryFare)) ? Number(summaryFare) * selectedSeats.length : 0;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h3 className="mb-0">
                <i className="fas fa-user-edit me-2"></i>
                Passenger Details
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
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  {passengers.map((p, idx) => (
                    <React.Fragment key={p.seatNumber}>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Passenger {idx + 1} Name (Seat {p.seatNumber})</Form.Label>
                          <Form.Control
                            type="text"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                            required
                            style={{ borderRadius: '10px' }}
                            placeholder="Enter name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Age</Form.Label>
                          <Form.Control
                            type="number"
                            value={p.age}
                            onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                            min="1"
                            max="120"
                            required
                            style={{ borderRadius: '10px' }}
                            placeholder="Enter age"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Gender</Form.Label>
                          <Form.Select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                            required
                            style={{ borderRadius: '10px' }}
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </React.Fragment>
                  ))}
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Phone Number (Contact)</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '10px' }}
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: '10px' }}
                    placeholder="Enter email address"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Special Requests (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleChange}
                    rows={3}
                    style={{ borderRadius: '10px' }}
                    placeholder="Any special requests or requirements..."
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                  style={{ 
                    borderRadius: '25px', 
                    padding: '12px 30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Confirm Booking
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-receipt me-2"></i>
                Booking Summary
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {tripInfo && (
                <div>
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
                      <span>Bus Number:</span>
                      <span className="fw-bold">{tripInfo.bus?.busNumber || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Bus Type:</span>
                      <span className="fw-bold">{tripInfo.bus?.busType || 'Standard'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Selected Seats:</span>
                      <span className="fw-bold">{selectedSeats.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Seat Numbers:</span>
                      <span className="fw-bold">{selectedSeats.sort((a, b) => a - b).join(', ')}</span>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-5 fw-bold">Total Amount:</span>
                    <span className="fs-4 fw-bold text-success">₹{totalAmount}</span>
                  </div>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Seats will be held for 5 minutes. Complete payment to confirm booking.
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Booking;
