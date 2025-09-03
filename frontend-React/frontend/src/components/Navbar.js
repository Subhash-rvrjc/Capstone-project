import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setExpanded(false);
  };

  const handleNavClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar 
      bg="primary" 
      variant="dark" 
      expand="lg" 
      className="px-3"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" onClick={handleNavClick}>
          <i className="fas fa-bus me-2"></i>
          Bus Ticket System
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleNavClick}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/search" onClick={handleNavClick}>
              Search Trips
            </Nav.Link>
            
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <>
                <Nav.Link as={Link} to="/my-bookings" onClick={handleNavClick}>
                  My Bookings
                </Nav.Link>
              </>
            )}
            
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} className="text-white">
                  Admin Panel
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin" onClick={handleNavClick}>
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/buses" onClick={handleNavClick}>
                    Bus Management
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/routes" onClick={handleNavClick}>
                    Route Management
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/trips" onClick={handleNavClick}>
                    Trip Management
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/reports" onClick={handleNavClick}>
                    Reports
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/login" onClick={handleNavClick}>
                  <Button variant="outline-light" size="sm">
                    Login
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register" onClick={handleNavClick}>
                  <Button variant="light" size="sm">
                    Register
                  </Button>
                </Nav.Link>
              </>
            ) : (
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} className="text-white">
                  <i className="fas fa-user me-1"></i>
                  {user?.name || 'User'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    <small className="text-muted">Signed in as</small><br />
                    <strong>{user?.email}</strong>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
