import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    source: '',
    destination: '',
    travelDate: '',
    passengers: 1
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!searchForm.source.trim()) {
      newErrors.source = 'Source is required';
    }
    if (!searchForm.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!searchForm.travelDate) {
      newErrors.travelDate = 'Travel date is required';
    }
    if (searchForm.passengers < 1) {
      newErrors.passengers = 'At least 1 passenger is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Navigate to search page with query parameters
    const queryParams = new URLSearchParams(searchForm).toString();
    navigate(`/search?${queryParams}`);
  };

  const popularRoutes = [
    { source: 'Mumbai', destination: 'Pune', price: '₹450' },
    { source: 'Delhi', destination: 'Agra', price: '₹350' },
    { source: 'Bangalore', destination: 'Chennai', price: '₹400' },
    { source: 'Hyderabad', destination: 'Vijayawada', price: '₹250' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section text-white py-5" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
                                            <h1 className="display-4 fw-bold mb-4">
                 Book Your Bus Tickets Online
               </h1>
              <p className="lead mb-4 text-light">
                Discover and book bus tickets to your favorite destinations across India. 
                Safe, secure, and convenient travel booking platform.
              </p>
              {!isAuthenticated && (
                <Button 
                  variant="light" 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="me-3 shadow"
                  style={{ borderRadius: '25px', padding: '12px 30px' }}
                >
                  Get Started
                </Button>
              )}
            </Col>
            <Col lg={6}>
              {/* Search Form */}
              <Card className="shadow-lg border-0" style={{ borderRadius: '20px' }}>
                <Card.Body className="p-4">
                  <h4 className="text-dark mb-3 text-center">
                    <i className="fas fa-search me-2 text-primary"></i>
                    Search Bus Tickets
                  </h4>
                  <Form onSubmit={handleSearch}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">From</Form.Label>
                          <Form.Control
                            type="text"
                            name="source"
                            value={searchForm.source}
                            onChange={handleInputChange}
                            placeholder="Enter source city"
                            isInvalid={!!errors.source}
                            style={{ borderRadius: '10px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.source}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">To</Form.Label>
                          <Form.Control
                            type="text"
                            name="destination"
                            value={searchForm.destination}
                            onChange={handleInputChange}
                            placeholder="Enter destination city"
                            isInvalid={!!errors.destination}
                            style={{ borderRadius: '10px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.destination}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Travel Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="travelDate"
                            value={searchForm.travelDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            isInvalid={!!errors.travelDate}
                            style={{ borderRadius: '10px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.travelDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Passengers</Form.Label>
                          <Form.Control
                            type="number"
                            name="passengers"
                            value={searchForm.passengers}
                            onChange={handleInputChange}
                            min="1"
                            max="10"
                            isInvalid={!!errors.passengers}
                            style={{ borderRadius: '10px' }}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.passengers}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      className="w-100 shadow"
                      style={{ 
                        borderRadius: '25px', 
                        padding: '12px 30px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      <i className="fas fa-search me-2"></i>
                      Search Buses
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold mb-3">Why Choose Us?</h2>
            <p className="text-muted fs-5">Experience the best in bus travel booking</p>
          </Col>
        </Row>
        <Row>
          <Col md={4} className="text-center mb-4">
            <div className="feature-card p-4 h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="feature-icon mb-3">
                <i className="fas fa-shield-alt fa-3x" style={{ color: '#667eea' }}></i>
              </div>
              <h4 className="fw-bold">Safe & Secure</h4>
              <p className="text-muted">
                Your data and payments are protected with industry-standard security measures.
              </p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="feature-card p-4 h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="feature-icon mb-3">
                <i className="fas fa-clock fa-3x" style={{ color: '#764ba2' }}></i>
              </div>
              <h4 className="fw-bold">24/7 Support</h4>
              <p className="text-muted">
                Round-the-clock customer support to help you with any queries or issues.
              </p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="feature-card p-4 h-100 shadow-sm" style={{ borderRadius: '15px' }}>
              <div className="feature-icon mb-3">
                <i className="fas fa-mobile-alt fa-3x" style={{ color: '#667eea' }}></i>
              </div>
              <h4 className="fw-bold">Mobile Friendly</h4>
              <p className="text-muted">
                Book tickets on the go with our mobile-responsive website and app.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Popular Routes */}
      <div className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="fw-bold mb-3">Popular Routes</h2>
              <p className="text-muted fs-5">Most booked routes by our customers</p>
            </Col>
          </Row>
          <Row>
            {popularRoutes.map((route, index) => (
              <Col md={3} key={index} className="mb-3">
                <Card className="h-100 shadow-sm border-0" style={{ borderRadius: '15px' }}>
                  <Card.Body className="text-center p-4">
                    <h5 className="card-title fw-bold">{route.source} → {route.destination}</h5>
                    <p className="card-text fw-bold fs-4" style={{ color: '#667eea' }}>From {route.price}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {
                        setSearchForm({
                          source: route.source,
                          destination: route.destination,
                          travelDate: '',
                          passengers: 1
                        });
                        navigate('/search');
                      }}
                      style={{ borderRadius: '20px' }}
                    >
                      Book Now
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Additional Features */}
      <Container className="py-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h3 className="fw-bold mb-4">Real-time Seat Selection</h3>
            <p className="text-muted mb-4">
              Choose your preferred seats with our interactive seat map. Get real-time updates on seat availability and make informed decisions.
            </p>
            <ul className="list-unstyled">
              <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Interactive seat map</li>
              <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Real-time availability</li>
              <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Multiple seat selection</li>
            </ul>
          </Col>
          <Col md={6} className="text-center">
            <div className="p-4" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              color: 'white'
            }}>
              <i className="fas fa-bus fa-5x mb-3"></i>
              <h4>Comfortable Journey</h4>
              <p>Travel in comfort with our premium bus services</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
