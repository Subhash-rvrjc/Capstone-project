import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Alert, Button, Table, Modal, Form, 
  Badge, Row, Col 
} from 'react-bootstrap';
import { tripAPI, busAPI, routeAPI } from '../services/api';

const TripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [formData, setFormData] = useState({
    busId: '',
    routeId: '',
    tripDate: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    isActive: true
  });

  const tripStatuses = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'DELAYED', label: 'Delayed' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [tripsResponse, busesResponse, routesResponse] = await Promise.all([
        tripAPI.getAll(),
        busAPI.getAll(),
        routeAPI.getAll()
      ]);

      setTrips(tripsResponse.data || []);
      setBuses(busesResponse.data || []);
      setRoutes(routesResponse.data || []);
    } catch (err) {
      console.error('Fetch data error:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        busId: trip.bus?.id?.toString() || '',
        routeId: trip.route?.id?.toString() || '',
        tripDate: trip.tripDate,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        fare: trip.fare?.toString() || '',
        isActive: trip.isActive
      });
    } else {
      setEditingTrip(null);
      setFormData({
        busId: '',
        routeId: '',
        tripDate: '',
        departureTime: '',
        arrivalTime: '',
        fare: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrip(null);
    setFormData({
      busId: '',
      routeId: '',
      tripDate: '',
      departureTime: '',
      arrivalTime: '',
      fare: '',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const tripData = {
        ...formData,
        bus: { id: parseInt(formData.busId) },
        route: { id: parseInt(formData.routeId) },
        fare: parseFloat(formData.fare)
      };

      if (editingTrip) {
        await tripAPI.update(editingTrip.id, tripData);
      } else {
        await tripAPI.create(tripData);
      }

      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Save trip error:', err);
      setError(err.response?.data?.message || 'Failed to save trip');
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await tripAPI.delete(tripId);
        fetchData();
      } catch (err) {
        console.error('Delete trip error:', err);
        setError(err.response?.data?.message || 'Failed to delete trip');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'SCHEDULED': 'primary',
      'IN_PROGRESS': 'info',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'DELAYED': 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getActiveBadge = (isActive) => {
    return isActive ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="danger">Inactive</Badge>;
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
          <p className="mt-3">Loading trips...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-calendar-alt me-2 text-primary"></i>
          Trip Management
        </h2>
        <Button 
          variant="primary" 
          onClick={() => handleShowModal()}
          style={{ 
            borderRadius: '25px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          <i className="fas fa-plus me-2"></i>
          Schedule New Trip
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            All Trips ({trips.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {trips.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Trip Code</th>
                    <th>Route</th>
                    <th>Bus</th>
                    <th>Date & Time</th>
                    <th>Fare</th>
                    <th>Status</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id}>
                      <td>
                        <Badge bg="info">{trip.tripCode}</Badge>
                      </td>
                      <td>
                        <div>
                          <strong>{trip.route?.source} → {trip.route?.destination}</strong>
                          <br />
                          <small className="text-muted">
                            {trip.route?.distance} km • {Math.floor(trip.route?.duration / 60)}h {trip.route?.duration % 60}m
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{trip.bus?.busNumber}</strong>
                          <br />
                          <small className="text-muted">{trip.bus?.busType}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{formatDate(trip.tripDate)}</strong>
                          <br />
                          <small className="text-muted">
                            {formatTime(trip.departureTime)} - {formatTime(trip.arrivalTime)}
                          </small>
                        </div>
                      </td>
                      <td>
                        <strong className="text-success">{formatCurrency(trip.fare)}</strong>
                      </td>
                      <td>{getStatusBadge(trip.status)}</td>
                      <td>{getActiveBadge(trip.isActive)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowModal(trip)}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(trip.id)}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
              <h5>No trips found</h5>
              <p className="text-muted">Start by scheduling your first trip.</p>
              <Button 
                variant="primary" 
                onClick={() => handleShowModal()}
                style={{ 
                  borderRadius: '25px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Schedule First Trip
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Trip Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-calendar-alt me-2"></i>
            {editingTrip ? 'Edit Trip' : 'Schedule New Trip'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bus *</Form.Label>
                  <Form.Select
                    name="busId"
                    value={formData.busId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Bus</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>
                        {bus.busNumber} - {bus.busType} ({bus.operatorName})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Route *</Form.Label>
                  <Form.Select
                    name="routeId"
                    value={formData.routeId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.source} → {route.destination} ({route.distance} km)
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trip Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="tripDate"
                    value={formData.tripDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fare (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="fare"
                    value={formData.fare}
                    onChange={handleInputChange}
                    placeholder="Enter fare amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Departure Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Arrival Time *</Form.Label>
                  <Form.Control
                    type="time"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                label="Active"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              style={{ 
                borderRadius: '25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <i className="fas fa-save me-2"></i>
              {editingTrip ? 'Update Trip' : 'Schedule Trip'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TripManagement;
