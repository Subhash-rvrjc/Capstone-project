import React, { useState, useEffect } from 'react';
import { 
  Container, Card, Alert, Button, Table, Modal, Form, 
  Badge, Row, Col, InputGroup 
} from 'react-bootstrap';
import { busAPI } from '../services/api';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    busNumber: '',
    busType: 'AC_SLEEPER',
    operatorName: '',
    totalSeats: '',
    amenities: '',
    isActive: true
  });

  const busTypes = [
    { value: 'AC_SLEEPER', label: 'AC Sleeper' },
    { value: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper' },
    { value: 'AC_SEATER', label: 'AC Seater' },
    { value: 'NON_AC_SEATER', label: 'Non-AC Seater' },
    { value: 'LUXURY', label: 'Luxury' }
  ];

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await busAPI.getAll();
      setBuses(response.data || []);
    } catch (err) {
      console.error('Fetch buses error:', err);
      setError(err.response?.data?.message || 'Failed to load buses');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        busNumber: bus.busNumber,
        busType: bus.busType,
        operatorName: bus.operatorName,
        totalSeats: bus.totalSeats.toString(),
        amenities: bus.amenities || '',
        isActive: bus.isActive
      });
    } else {
      setEditingBus(null);
      setFormData({
        busNumber: '',
        busType: 'AC_SLEEPER',
        operatorName: '',
        totalSeats: '',
        amenities: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBus(null);
    setFormData({
      busNumber: '',
      busType: 'AC_SLEEPER',
      operatorName: '',
      totalSeats: '',
      amenities: '',
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
      const busData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats),
        amenities: formData.amenities || null
      };

      if (editingBus) {
        await busAPI.update(editingBus.id, busData);
      } else {
        await busAPI.create(busData);
      }

      handleCloseModal();
      fetchBuses();
    } catch (err) {
      console.error('Save bus error:', err);
      setError(err.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleDelete = async (busId) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await busAPI.delete(busId);
        fetchBuses();
      } catch (err) {
        console.error('Delete bus error:', err);
        setError(err.response?.data?.message || 'Failed to delete bus');
      }
    }
  };

  const getBusTypeBadge = (busType) => {
    const type = busTypes.find(t => t.value === busType);
    return <Badge bg="info">{type ? type.label : busType}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="danger">Inactive</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading buses...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-bus me-2 text-primary"></i>
          Bus Management
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
          Add New Bus
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
            All Buses ({buses.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {buses.length > 0 ? (
            <div className="table-responsive">
              <Table className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Operator</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus.id}>
                      <td>
                        <strong>{bus.busNumber}</strong>
                      </td>
                      <td>{getBusTypeBadge(bus.busType)}</td>
                      <td>{bus.operatorName}</td>
                      <td>
                        <Badge bg="secondary">{bus.totalSeats}</Badge>
                      </td>
                      <td>{getStatusBadge(bus.isActive)}</td>
                      <td>
                        {new Date(bus.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowModal(bus)}
                            style={{ borderRadius: '20px' }}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(bus.id)}
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
              <i className="fas fa-bus fa-3x text-muted mb-3"></i>
              <h5>No buses found</h5>
              <p className="text-muted">Start by adding your first bus.</p>
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
                Add First Bus
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Bus Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-bus me-2"></i>
            {editingBus ? 'Edit Bus' : 'Add New Bus'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bus Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="busNumber"
                    value={formData.busNumber}
                    onChange={handleInputChange}
                    placeholder="Enter bus number"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bus Type *</Form.Label>
                  <Form.Select
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    required
                  >
                    {busTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Operator Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleInputChange}
                    placeholder="Enter operator name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Seats *</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    placeholder="Enter total seats"
                    min="1"
                    max="100"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Amenities</Form.Label>
              <Form.Control
                as="textarea"
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="Enter amenities (WiFi, AC, etc.)"
                rows={3}
              />
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
              {editingBus ? 'Update Bus' : 'Add Bus'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default BusManagement;
