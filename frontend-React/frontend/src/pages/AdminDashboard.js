import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Table } from 'react-bootstrap';
import { reportAPI, bookingAPI, tripAPI } from '../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeTrips: 0,
    totalUsers: 0,
    recentBookings: [],
    topRoutes: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard data from backend
      const [dashboardResponse, bookingsResponse, tripsResponse] = await Promise.all([
        reportAPI.getDashboardData(),
        bookingAPI.getAll(),
        tripAPI.getAll()
      ]);

      const dashboard = dashboardResponse.data;
      const bookings = bookingsResponse.data || [];
      const trips = tripsResponse.data || [];

      // Calculate additional stats
      const activeTrips = trips.filter(trip => trip.status === 'SCHEDULED').length;
      const recentBookings = bookings.slice(0, 5); // Last 5 bookings

      setDashboardData({
        ...dashboard,
        activeTrips,
        recentBookings
      });

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-tachometer-alt me-2 text-primary"></i>
          Admin Dashboard
        </h2>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={fetchDashboardData}
        >
          <i className="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-primary mb-2">
                <i className="fas fa-ticket-alt fa-2x"></i>
              </div>
              <h3 className="text-primary mb-1">{dashboardData.totalBookings}</h3>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-success mb-2">
                <i className="fas fa-rupee-sign fa-2x"></i>
              </div>
              <h3 className="text-success mb-1">{formatCurrency(dashboardData.totalRevenue)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-info mb-2">
                <i className="fas fa-bus fa-2x"></i>
              </div>
              <h3 className="text-info mb-1">{dashboardData.activeTrips}</h3>
              <p className="text-muted mb-0">Active Trips</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-warning mb-2">
                <i className="fas fa-users fa-2x"></i>
              </div>
              <h3 className="text-warning mb-1">{dashboardData.totalUsers}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Activity and Quick Stats */}
      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>
                Recent Bookings
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.recentBookings.length > 0 ? (
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>Route</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <strong>{booking.bookingCode}</strong>
                          </td>
                          <td>
                            {booking.trip?.route?.source} → {booking.trip?.route?.destination}
                          </td>
                          <td className="text-success">
                            <strong>{formatCurrency(booking.totalAmount)}</strong>
                          </td>
                          <td>{getStatusBadge(booking.status)}</td>
                          <td>{formatDate(booking.bookingDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No recent bookings found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Quick Stats
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Today's Bookings</span>
                  <strong className="text-primary">
                    {dashboardData.recentBookings.filter(b => 
                      new Date(b.bookingDate).toDateString() === new Date().toDateString()
                    ).length}
                  </strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending Payments</span>
                  <strong className="text-warning">
                    {dashboardData.recentBookings.filter(b => b.status === 'PENDING').length}
                  </strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Confirmed Today</span>
                  <strong className="text-success">
                    {dashboardData.recentBookings.filter(b => 
                      b.status === 'CONFIRMED' && 
                      new Date(b.bookingDate).toDateString() === new Date().toDateString()
                    ).length}
                  </strong>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Avg. Booking Value</span>
                  <strong className="text-info">
                    {dashboardData.recentBookings.length > 0 
                      ? formatCurrency(
                          dashboardData.recentBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / 
                          dashboardData.recentBookings.length
                        )
                      : formatCurrency(0)
                    }
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
