import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';

const SeatSelection = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getCapacityFromBus = (bus) => {
    if (!bus) return null;
    const candidates = [
      bus.totalSeats,
      bus.seatCount,
      bus.capacity,
      bus.noOfSeats,
      bus.noOfSeat,
      bus.numberOfSeats,
      bus.seatsCount,
      bus.totalSeatCount,
      bus.seatCapacity,
      bus.busCapacity,
      bus.total_seats
    ];
    const found = candidates.find(v => Number.isFinite(Number(v)) && Number(v) > 0);
    return found ? Number(found) : null;
  };

  const fetchSeats = async () => {
    try {
      const response = await tripAPI.getSeats(tripId);
      const data = response.data;
      const apiSeats = Array.isArray(data?.seats) ? data.seats : [];
      const info = data?.trip || data || null;

      // Prefer API seats if provided
      if (apiSeats.length > 0) {
        // Normalize and filter out already booked or actively held seats
        const now = new Date();
        const normalized = apiSeats.map((s) => {
          const holdExpiry = s.holdExpiry ? new Date(s.holdExpiry) : null;
          const holdActive = Boolean(s.isHold) && (!holdExpiry || holdExpiry > now);
          const isBooked = Boolean(s.isBooked) || String(s.status).toUpperCase() === 'BOOKED';
          const isHold = holdActive || String(s.status).toUpperCase() === 'HOLD';
          return { ...s, isBooked, isHold };
        });
        const availableOnly = normalized.filter((seat) => !seat.isBooked && !seat.isHold);
        setSeats(availableOnly);
        setTripInfo(info);
      } else {
        // No seats returned: try to derive from trip details/bus capacity
        let capacity = getCapacityFromBus(info?.bus);
        if (!capacity || !Number.isFinite(Number(capacity))) {
          try {
            const tripResp = await tripAPI.getById(tripId);
            const t = tripResp.data || {};
            setTripInfo(t);
            capacity = getCapacityFromBus(t?.bus);
          } catch (_) {
            setTripInfo(info);
          }
        } else {
          setTripInfo(info);
        }

        capacity = Number(capacity);
        if (!Number.isFinite(capacity) || capacity <= 0) {
          // As a final fallback, assume 50 seats
          capacity = 50;
        }
        if (Number.isFinite(capacity) && capacity > 0) {
          const generated = Array.from({ length: capacity }, (_, i) => ({
            id: `virtual-${i + 1}`,
            seatNumber: i + 1,
            isBooked: false,
            isHold: false
          }));
          setSeats(generated);
        } else { setSeats([]); }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleSeatClick = (seat) => {
    if (seat.isBooked || seat.isHold) return;
    
    setSelectedSeats(prev => {
      const seatNumber = seat.seatNumber;
      if (prev.includes(seatNumber)) {
        return prev.filter(num => num !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    navigate(`/booking/${tripId}`, { 
      state: { 
        tripId, 
        selectedSeats,
        tripInfo 
      } 
    });
  };

  const getSeatVariant = (seat) => {
    if (seat.isBooked) return 'secondary';
    if (seat.isHold) return 'warning';
    if (selectedSeats.includes(seat.seatNumber)) return 'success';
    return 'outline-primary';
  };

  const getSeatStatusClass = (seat) => {
    if (seat.isBooked) return 'booked';
    if (seat.isHold) return 'hold';
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    return '';
  };

  const getSeatIcon = (seat) => {
    if (seat.isBooked) return 'fas fa-times';
    if (seat.isHold) return 'fas fa-clock';
    if (selectedSeats.includes(seat.seatNumber)) return 'fas fa-check';
    return 'fas fa-chair';
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading seat information...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h3 className="mb-0">
            <i className="fas fa-chair me-2"></i>
            Select Your Seats
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          {tripInfo && (
            <div className="mb-4 p-3" style={{ 
              backgroundColor: '#f8f9fa', 
              borderRadius: '10px',
              border: '1px solid #e9ecef'
            }}>
              <Row>
                <Col md={3}>
                  <div className="text-center">
                    <i className="fas fa-bus fa-2x text-primary mb-2"></i>
                    <div className="fw-bold">{tripInfo.bus?.busNumber || 'N/A'}</div>
                    <Badge bg="info">{tripInfo.bus?.busType || 'Standard'}</Badge>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fw-bold text-primary">{formatTime(tripInfo.departureTime)}</div>
                    <small className="text-muted">Departure Time</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fw-bold">{tripInfo.route?.source} → {tripInfo.route?.destination}</div>
                    <small className="text-muted">{formatDate(tripInfo.tripDate)}</small>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-center">
                    <div className="fw-bold text-success fs-4">₹{tripInfo?.fare ?? tripInfo?.price ?? tripInfo?.farePerSeat ?? tripInfo?.amountPerSeat ?? '—'}</div>
                    <small className="text-muted">per seat</small>
                  </div>
                </Col>
              </Row>
            </div>
          )}
          
          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px' }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          
          <div className="seat-map">
            <div className="text-center mb-4">
              <h5 className="text-muted">
                <i className="fas fa-arrow-up me-2"></i>
                Front of Bus
              </h5>
            </div>
            
            <div className="seat-grid mb-4" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              {seats.map((seat) => (
                <Button
                  key={seat.id}
                  variant={getSeatVariant(seat)}
                  className={`seat-button ${getSeatStatusClass(seat)}`}
                  onClick={() => handleSeatClick(seat)}
                  disabled={seat.isBooked || seat.isHold}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '2px solid',
                    minHeight: '50px'
                  }}
                >
                  <i className={`${getSeatIcon(seat)} me-1`}></i>
                  {seat.seatNumber}
                </Button>
              ))}
            </div>
            
            <div className="seat-legend text-center mb-4">
              <h6 className="mb-3">Seat Legend</h6>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <div className="d-flex align-items-center">
                  <Button variant="outline-primary" size="sm" disabled style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-chair"></i>
                  </Button>
                  <span className="ms-2">Available</span>
                </div>
                <div className="d-flex align-items-center">
                  <Button variant="success" size="sm" disabled style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-check"></i>
                  </Button>
                  <span className="ms-2">Selected</span>
                </div>
                <div className="d-flex align-items-center">
                  <Button variant="secondary" size="sm" disabled style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-times"></i>
                  </Button>
                  <span className="ms-2">Booked</span>
                </div>
                <div className="d-flex align-items-center">
                  <Button variant="warning" size="sm" disabled style={{ width: '40px', height: '40px' }}>
                    <i className="fas fa-clock"></i>
                  </Button>
                  <span className="ms-2">Hold</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="mb-3">
              <h5>
                <i className="fas fa-ticket-alt me-2 text-primary"></i>
                Selected Seats: <Badge bg="primary" className="fs-6">{selectedSeats.length}</Badge>
              </h5>
              {selectedSeats.length > 0 && (
                <p className="text-muted">
                  Seat Numbers: {selectedSeats.sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              style={{ 
                borderRadius: '25px', 
                padding: '12px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <i className="fas fa-arrow-right me-2"></i>
              Proceed to Booking
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SeatSelection;
