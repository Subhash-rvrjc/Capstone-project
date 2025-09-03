import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Alert, Button, Table, Modal, Form, 
  Badge, Row, Col 
} from 'react-bootstrap';
import { routeAPI } from '../services/api';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    distance: '',
    duration: '',
    stops: '',
    isActive: true
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await routeAPI.getAll();
      setRoutes(response.data || []);
    } catch (err) {
      console.error('Fetch routes error:', err);
      setError(err.response?.data?.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        source: route.source,
        destination: route.destination,
        distance: route.distance.toString(),
        duration: route.duration.toString(),
        stops: route.stops || '',
        isActive: route.isActive
      });
    } else {
      setEditingRoute(null);
      setFormData({
        source: '',
        destination: '',
        distance: '',
        duration: '',
        stops: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoute(null);
    setFormData({
      source: '',
      destination: '',
      distance: '',
      duration: '',
      stops: '',
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
      const routeData = {
        ...formData,
        distance: parseFloat(formData.distance),
        duration: parseInt(formData.duration),
        stops: formData.stops || null
      };

      if (editingRoute) {
        await routeAPI.update(editingRoute.id, routeData);
      } else {
        await routeAPI.create(routeData);
      }

      handleCloseModal();
      fetchRoutes();
    } catch (err) {
      console.error('Save route error:', err);
      setError(err.response?.data?.message || 'Failed to save route');
    }
  };

  const handleDelete = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await routeAPI.delete(routeId);
        fetchRoutes();
      } catch (err) {
        console.error('Delete route error:', err);
        setError(err.response?.data?.message || 'Failed to delete route');
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="danger">Inactive</Badge>;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading routes...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-route me-2 text-primary"></i>
          Route Management
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
          Add New Route
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
            All Routes ({routes.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {routes.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Route Code</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id}>
                      <td>
                        <Badge bg="info">{route.routeCode}</Badge>
                      </td>
                      <td>
                        <strong>{route.source}</strong>
                      </td>
                      <td>
                        <strong>{route.destination}</strong>
                      </td>
                      <td>
                        <Badge bg="secondary">{route.distance} km</Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark">
                          {formatDuration(route.duration)}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(route.isActive)}</td>
                      <td>
                        {new Date(route.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowModal(route)}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(route.id)}
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
              <i className="fas fa-route fa-3x text-muted mb-3"></i>
              <h5>No routes found</h5>
              <p className="text-muted">Start by adding your first route.</p>
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
                Add First Route
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Route Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-route me-2"></i>
            {editingRoute ? 'Edit Route' : 'Add New Route'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Source City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    placeholder="Enter source city"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Destination City *</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="Enter destination city"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Distance (km) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    placeholder="Enter distance in km"
                    min="1"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="Enter duration in minutes"
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Intermediate Stops</Form.Label>
              <Form.Control
                as="textarea"
                name="stops"
                value={formData.stops}
                onChange={handleInputChange}
                placeholder="Enter intermediate stops (comma separated)"
                rows={3}
              />
              <Form.Text className="text-muted">
                Example: Pune, Lonavala, Karjat
              </Form.Text>
            </Form.Group>

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
              {editingRoute ? 'Update Route' : 'Add Route'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default RouteManagement;
