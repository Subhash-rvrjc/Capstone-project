import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Alert, Button, Table, Row, Col, 
  Badge, Form, InputGroup 
} from 'react-bootstrap';
import { reportAPI } from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState({
    sales: {},
    occupancy: {},
    routePerformance: {},
    dashboard: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [salesResponse, occupancyResponse, routeResponse, dashboardResponse] = await Promise.all([
        reportAPI.getSalesReport(dateRange.startDate, dateRange.endDate),
        reportAPI.getOccupancyReport(dateRange.startDate, dateRange.endDate),
        reportAPI.getRoutePerformanceReport(dateRange.startDate, dateRange.endDate),
        reportAPI.getDashboardData()
      ]);

      setReports({
        sales: salesResponse.data || {},
        occupancy: occupancyResponse.data || {},
        routePerformance: routeResponse.data || {},
        dashboard: dashboardResponse.data || {}
      });

    } catch (err) {
      console.error('Fetch reports error:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'}/reports/download?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );
      if (!resp.ok) {
        throw new Error('Failed to generate report');
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${dateRange.startDate}_${dateRange.endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Failed to download report');
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      'CONFIRMED': 'success',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'COMPLETED': 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  // Normalize any value to an array for safe mapping
  const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value);
    return [];
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading reports...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-chart-bar me-2 text-primary"></i>
          Reports & Analytics
        </h2>
        <Button 
          variant="outline-primary" 
          onClick={fetchReports}
          style={{ borderRadius: '25px' }}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh Reports
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Date Range Filter */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                onClick={() => { fetchReports(); handleDownload(); }}
                style={{ 
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="fas fa-search me-2"></i>
                Generate Report
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sales Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-success mb-2">
                <i className="fas fa-rupee-sign fa-2x"></i>
              </div>
              <h3 className="text-success mb-1">{formatCurrency(reports.sales.totalRevenue)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-primary mb-2">
                <i className="fas fa-ticket-alt fa-2x"></i>
              </div>
              <h3 className="text-primary mb-1">{reports.sales.totalBookings || 0}</h3>
              <p className="text-muted mb-0">Total Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-info mb-2">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <h3 className="text-info mb-1">{formatCurrency(reports.sales.averageBookingValue || 0)}</h3>
              <p className="text-muted mb-0">Avg. Booking Value</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="p-4">
              <div className="text-warning mb-2">
                <i className="fas fa-percentage fa-2x"></i>
              </div>
              <h3 className="text-warning mb-1">{formatPercentage(reports.occupancy.overallOccupancy || 0)}</h3>
              <p className="text-muted mb-0">Occupancy Rate</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports */}
      <Row>
        {/* Sales Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-success text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>
                Sales Report
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Confirmed Bookings:</span>
                  <strong className="text-success">{reports.sales.confirmedBookings || 0}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Pending Bookings:</span>
                  <strong className="text-warning">{reports.sales.pendingBookings || 0}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Cancelled Bookings:</span>
                  <strong className="text-danger">{reports.sales.cancelledBookings || 0}</strong>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Success Rate:</span>
                  <strong className="text-info">
                    {reports.sales.totalBookings > 0 
                      ? formatPercentage((reports.sales.confirmedBookings || 0) / reports.sales.totalBookings * 100)
                      : '0%'
                    }
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Occupancy Report */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Header className="bg-info text-white" style={{ borderRadius: '15px 15px 0 0' }}>
              <h5 className="mb-0">
                <i className="fas fa-bus me-2"></i>
                Occupancy Report
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Total Seats:</span>
                  <strong>{reports.occupancy.totalSeats || 0}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Booked Seats:</span>
                  <strong className="text-success">{reports.occupancy.bookedSeats || 0}</strong>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Available Seats:</span>
                  <strong className="text-info">{reports.occupancy.availableSeats || 0}</strong>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <span>Occupancy Rate:</span>
                  <strong className="text-warning">{formatPercentage(reports.occupancy.overallOccupancy || 0)}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Route Performance */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h5 className="mb-0">
            <i className="fas fa-route me-2"></i>
            Route Performance
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {asArray(reports.routePerformance?.topRoutes).length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Route</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Occupancy</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {asArray(reports.routePerformance?.topRoutes).map((route, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{route.source} → {route.destination}</strong>
                      </td>
                      <td>
                        <Badge bg="primary">{route.bookings}</Badge>
                      </td>
                      <td>
                        <strong className="text-success">{formatCurrency(route.revenue)}</strong>
                      </td>
                      <td>
                        <Badge bg="info">{formatPercentage(route.occupancy)}</Badge>
                      </td>
                      <td>
                        <Badge bg={route.performance === 'High' ? 'success' : route.performance === 'Medium' ? 'warning' : 'danger'}>
                          {route.performance}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-route fa-3x text-muted mb-3"></i>
              <p className="text-muted">No route performance data available</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-warning text-dark" style={{ borderRadius: '15px 15px 0 0' }}>
          <h5 className="mb-0">
            <i className="fas fa-clock me-2"></i>
            Recent Activity
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
            <p className="text-muted">Recent activity data will be displayed here</p>
            <small className="text-muted">This section will show recent bookings, payments, and system activities</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Reports;
