import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingAPI, ticketAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const mergeUniqueById = (primary = [], secondary = []) => {
    const seen = new Set(primary.map(b => String(b?.id)));
    const merged = [...primary];
    for (const b of secondary) {
      const id = String(b?.id);
      if (id && !seen.has(id)) {
        merged.push(b);
        seen.add(id);
      }
    }
    return merged;
  };

  const fetchBookings = async () => {
    setError('');
    let found = [];

    // Immediately seed with locally cached recent booking so UI updates at once
    try {
      const cached = JSON.parse(localStorage.getItem('recentBooking') || 'null');
      if (cached && cached.booking) {
        setBookings(prev => mergeUniqueById([cached.booking], prev));
      }
    } catch (_) {}
    try {
      const myResp = await bookingAPI.getMy();
      found = Array.isArray(myResp.data) ? myResp.data : [];
    } catch (_) {}

    if (found.length === 0) {
      try {
        const response = await bookingAPI.getUserBookings(user.id);
        found = Array.isArray(response.data) ? response.data : [];
      } catch (_) {}
    }

    if (found.length === 0) {
      try {
        const allResp = await bookingAPI.getAll();
        const all = Array.isArray(allResp.data) ? allResp.data : [];
        found = all.filter(b => String(b?.user?.id) === String(user.id));
      } catch (err) {
        // Ignore 401/403 (admin-only or unauthorized endpoint)
        const msg = err.response?.data?.message || '';
        if (![401, 403].includes(err?.response?.status) && !/access denied|forbidden/i.test(msg)) {
          setError(msg || 'Failed to load bookings');
        }
      }
    }

    if (found.length === 0) {
      try {
        const ticketsResp = await ticketAPI.getAll();
        const tickets = Array.isArray(ticketsResp.data) ? ticketsResp.data : [];
        const mineTickets = tickets.filter(t => String(t?.booking?.user?.id) === String(user.id));
        const byBookingId = new Map();
        mineTickets.forEach(t => {
          const b = t.booking;
          if (!b || !b.id) return;
          if (!byBookingId.has(b.id)) {
            byBookingId.set(b.id, b);
          }
        });
        found = Array.from(byBookingId.values());
      } catch (err) {
        const msg = err.response?.data?.message || '';
        if (![401, 403].includes(err?.response?.status) && !/access denied|forbidden/i.test(msg)) {
          setError(msg || 'Failed to load bookings');
        }
      }
    }

    // Fallback: show locally cached recent booking immediately after payment
    if (found.length === 0) {
      try {
        const cached = JSON.parse(localStorage.getItem('recentBooking') || 'null');
        if (cached && String(cached.userId) === String(user.id)) {
          found = [cached.booking];
        }
      } catch (_) {}
    }

    // Merge any seeded cached booking with fetched results
    setBookings(prev => {
      return mergeUniqueById(found, prev);
    });
    // Do not surface access-denied messages in UI for this page
    if (error && /access denied|forbidden/i.test(error)) {
      setError('');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      const paymentSuccess = Boolean(location.state?.paymentSuccess);
      const bookingId = location.state?.bookingId;
      if (paymentSuccess && bookingId) {
        // Prefer immediate display: merge/refetch and put this booking on top
        (async () => {
          try {
            const refreshed = await bookingAPI.getById(bookingId);
            const confirmed = refreshed?.data;
            if (confirmed) {
              setBookings(prev => {
                const without = prev.filter(b => String(b.id) !== String(bookingId));
                return [confirmed, ...without];
              });
            }
          } catch (_) {}
          fetchBookings();
        })();
      } else {
        fetchBookings();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, location.state?.paymentSuccess]);



  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingAPI.cancelBooking(bookingId, 'Cancelled by user');
        // Optimistically update UI
        setBookings(prev => prev.map(b => String(b.id) === String(bookingId) ? { ...b, status: 'CANCELLED' } : b));
        // Remove or update cached recent booking to prevent stale CONFIRMED
        try {
          const cached = JSON.parse(localStorage.getItem('recentBooking') || 'null');
          if (cached && String(cached.bookingId) === String(bookingId)) {
            // Update cached status to cancelled so fallback mirrors server
            const updated = { ...cached, booking: { ...cached.booking, status: 'CANCELLED' } };
            localStorage.setItem('recentBooking', JSON.stringify(updated));
          }
        } catch (_) {}
        // Finally, refresh from server
        fetchBookings();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'COMPLETED': 'info',
      'EXPIRED': 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your bookings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h3 className="mb-0">
            <i className="fas fa-ticket-alt me-2"></i>
            My Bookings
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px' }}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          
          {bookings.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
              <h5>No bookings found</h5>
              <p className="text-muted">You haven't made any bookings yet.</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/search'}
                style={{ 
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="fas fa-search me-2"></i>
                Search for Trips
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Booking ID</th>
                    <th>Route</th>
                    <th>Date & Time</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div className="fw-bold">{booking.bookingCode}</div>
                        <small className="text-muted">{formatDate(booking.bookingDate)}</small>
                      </td>
                      <td>
                        <div className="fw-bold">
                          {booking.trip?.route?.source} → {booking.trip?.route?.destination}
                        </div>
                        <small className="text-muted">
                          Bus: {booking.trip?.bus?.busNumber} ({booking.trip?.bus?.busType})
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold">{formatDate(booking.trip?.tripDate)}</div>
                        <small className="text-muted">{formatTime(booking.trip?.departureTime)}</small>
                      </td>
                      <td>
                        <div className="fw-bold">{booking.passengerCount}</div>
                        <small className="text-muted">
                          {booking.bookingSeats?.map(bs => bs.seat?.seatNumber).join(', ')}
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold text-success">₹{booking.totalAmount}</div>
                        {booking.refundAmount && (
                          <small className="text-danger">
                            Refund: ₹{booking.refundAmount}
                          </small>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(booking.status)}
                        {booking.cancellationReason && (
                          <div className="mt-1">
                            <small className="text-muted">
                              {booking.cancellationReason}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => navigate(`/tickets/${booking.id}`, { state: { booking } })}
                            disabled={booking.status !== 'CONFIRMED'}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-ticket-alt me-1"></i>
                            View Ticket
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => window.open(`/tickets/${booking.id}?download=1`, '_blank')}
                            disabled={booking.status !== 'CONFIRMED'}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-file-download me-1"></i>
                            Download PDF
                          </Button>
                          {booking.status === 'CONFIRMED' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                              style={{ borderRadius: '20px' }}
                            >
                              <i className="fas fa-times me-1"></i>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default MyBookings;
