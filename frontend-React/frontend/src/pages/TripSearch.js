import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tripAPI } from '../services/api';

const TripSearch = () => {
  const [searchData, setSearchData] = useState({
    source: '',
    destination: '',
    travelDate: '',
    passengers: 1
  });
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchData.source || !searchData.destination || !searchData.travelDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await tripAPI.search({
        source: searchData.source,
        destination: searchData.destination,
        travelDate: searchData.travelDate,
        passengers: searchData.passengers
      });

      setTrips(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load search params from URL if available
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const travelDate = searchParams.get('travelDate');
    const passengers = searchParams.get('passengers');

    if (source || destination || travelDate) {
      const newSearchData = {
        source: source || '',
        destination: destination || '',
        travelDate: travelDate || '',
        passengers: passengers ? parseInt(passengers) : 1
      };
      
      setSearchData(newSearchData);
      
      // Auto-search if we have the required parameters
      if (source && destination && travelDate) {
        // Auto-search with the new data
        setTimeout(() => {
          if (!newSearchData.source || !newSearchData.destination || !newSearchData.travelDate) {
            return;
          }
          
          setLoading(true);
          setError('');
          
          tripAPI.search({
            source: newSearchData.source,
            destination: newSearchData.destination,
            travelDate: newSearchData.travelDate,
            passengers: newSearchData.passengers
          }).then(response => {
            setTrips(response.data);
          }).catch(err => {
            setError(err.response?.data?.message || 'Failed to search trips. Please try again.');
          }).finally(() => {
            setLoading(false);
          });
        }, 0);
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectTrip = (tripId) => {
    navigate(`/seats/${tripId}`);
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

  return (
    <Container className="mt-4">
      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <Card.Header className="bg-primary text-white" style={{ borderRadius: '15px 15px 0 0' }}>
          <h3 className="mb-0">
            <i className="fas fa-search me-2"></i>
            Search Bus Trips
          </h3>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">From</Form.Label>
                  <Form.Control
                    type="text"
                    name="source"
                    value={searchData.source}
                    onChange={handleChange}
                    placeholder="Enter source city"
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">To</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={searchData.destination}
                    onChange={handleChange}
                    placeholder="Enter destination city"
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Date of Journey</Form.Label>
                  <Form.Control
                    type="date"
                    name="travelDate"
                    value={searchData.travelDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Passengers</Form.Label>
                  <Form.Control
                    type="number"
                    name="passengers"
                    value={searchData.passengers}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    style={{ borderRadius: '10px' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="w-100"
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
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-search me-2"></i>
                  Search Trips
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px' }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {trips.length > 0 && (
        <div>
          <h4 className="mb-4">
            <i className="fas fa-bus me-2 text-primary"></i>
            Available Trips ({trips.length})
          </h4>
          {trips.map((trip) => (
            <Card key={trip.id} className="mb-3 shadow-sm border-0" style={{ borderRadius: '15px' }}>
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={2}>
                    <div className="text-center">
                      <i className="fas fa-bus fa-2x text-primary mb-2"></i>
                      <div className="fw-bold">{trip.bus?.busNumber || 'N/A'}</div>
                      <Badge bg="info" className="mt-1">
                        {trip.bus?.busType || 'Standard'}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="fw-bold text-primary">{formatTime(trip.departureTime)}</div>
                      <small className="text-muted">Departure</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="fw-bold">{trip.route?.source} → {trip.route?.destination}</div>
                      <small className="text-muted">{formatDate(trip.tripDate)}</small>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <div className="fw-bold text-success fs-4">₹{trip.fare}</div>
                      <small className="text-muted">per seat</small>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="text-center">
                      <div className="mb-2">
                        <Badge bg={trip.availableSeats > 0 ? 'success' : 'danger'}>
                          {trip.availableSeats} seats available
                        </Badge>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={() => handleSelectTrip(trip.id)}
                        disabled={trip.availableSeats === 0}
                        style={{ 
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none'
                        }}
                      >
                        <i className="fas fa-ticket-alt me-1"></i>
                        Select
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {!loading && trips.length === 0 && !error && (
        <Card className="text-center p-5" style={{ borderRadius: '15px' }}>
          <Card.Body>
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5>No trips found</h5>
            <p className="text-muted">Try adjusting your search criteria or check for different dates.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TripSearch;
