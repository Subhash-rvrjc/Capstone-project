import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import api, { ticketAPI, bookingAPI } from '../services/api';

const Ticket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Primary attempt: fetch by bookingId
      let byBooking;
      try {
        byBooking = await ticketAPI.getByBooking(bookingId);
        setTicket(byBooking.data);
      } catch (err) {
        const msg = err.response?.data?.message || '';
        if (msg.toLowerCase().includes('not found')) {
          // Generate ticket then fetch again
          try {
            await ticketAPI.generateTicket(bookingId);
            const genResp = await ticketAPI.getByBooking(bookingId);
            setTicket(genResp.data);
          } catch (e) {
            throw e;
          }
        } else if (msg.toLowerCase().includes('more than one row') || msg.toLowerCase().includes('not return a unique')) {
          // Fetch all and choose the latest ticket for this booking
          const all = await ticketAPI.getAll();
          const list = Array.isArray(all.data) ? all.data : [];
          const candidates = list.filter(t => String(t?.booking?.id) === String(bookingId));
          if (candidates.length > 0) {
            candidates.sort((a, b) => new Date(b.createdAt || b.issuedAt || 0) - new Date(a.createdAt || a.issuedAt || 0));
            setTicket(candidates[0]);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      try {
        const bookResp = await bookingAPI.getById(bookingId);
        setBooking(bookResp.data);
      } catch (_) {}
    } catch (err) {
      const msg = err.response?.data?.message || '';
      setError(msg || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.booking && !booking) {
      setBooking(location.state.booking);
    }
    if (bookingId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const shouldDownload = params.get('download') === '1';
    if (shouldDownload && ticket && booking) {
      handleDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, booking, location.search]);

  const handleDownload = async () => {
    try {
      if (!ticket?.id) {
        throw new Error('No ticket available');
      }
      const resp = await api.get(`/tickets/${ticket.id}/pdf`, { responseType: 'blob' });
      if (resp && resp.data) {
        const blob = new Blob([resp.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ticket_${booking?.bookingCode || ticket?.ticketNumber || ticket?.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
      throw new Error('Empty PDF');
    } catch (e) {
      // Fallback: use browser print if backend PDF endpoint is unavailable
      window.print();
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading ticket...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
        {!ticket && booking && (
          <Button className="ms-2" variant="primary" onClick={loadData}>
            Try Generate Ticket
          </Button>
        )}
        <Button className="ms-2" variant="outline-primary" onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  const trip = booking?.trip || ticket?.booking?.trip || {};
  const route = trip?.route || {};
  const bus = trip?.bus || {};
  const passengerNames = (booking?.bookingSeats || ticket?.booking?.bookingSeats || [])
    .map(bs => bs?.seat?.seatNumber)
    .filter(Boolean)
    .join(', ');

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h3 className="mb-0">
            <i className="fas fa-ticket-alt me-2"></i>
            Ticket
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          <Row>
            <Col md={8}>
              <div className="mb-3">
                <h5 className="mb-1">Booking #{booking?.bookingCode || ticket?.ticketNumber}</h5>
                <div className="text-muted">{formatDate(trip?.tripDate)} · {formatTime(trip?.departureTime)}</div>
              </div>

              <div className="mb-3 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                <Row>
                  <Col md={4}>
                    <div className="fw-semibold">Route</div>
                    <div>{route?.source} → {route?.destination}</div>
                  </Col>
                  <Col md={4}>
                    <div className="fw-semibold">Bus</div>
                    <div>{bus?.busNumber || 'N/A'} <Badge bg="info">{bus?.busType || 'Standard'}</Badge></div>
                  </Col>
                  <Col md={4}>
                    <div className="fw-semibold">Seats</div>
                    <div>{passengerNames || booking?.passengerCount}</div>
                  </Col>
                </Row>
              </div>

              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-semibold">Passenger Count</div>
                  <div>{booking?.passengerCount}</div>
                </div>
                <div>
                  <div className="fw-semibold">Amount Paid</div>
                  <div className="text-success fw-bold">₹{booking?.totalAmount}</div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <div className="mb-3">
                <Badge bg="success">{booking?.status || 'CONFIRMED'}</Badge>
              </div>
              <Button variant="success" onClick={handleDownload} style={{ borderRadius: '25px' }}>
                <i className="fas fa-download me-2"></i>
                Download PDF
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Ticket;


