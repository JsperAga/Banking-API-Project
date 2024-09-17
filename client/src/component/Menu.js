import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'; // Import your custom CSS file

function MenuComponent() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Navbar className="navbar-custom" expand="lg">
      <Container>
        <Navbar.Brand href="/welcome">
          <img src="/img/Merlin-Logo.png" alt="ZendApp" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto"> {/* Use ms-auto for margin start auto */}
            {user ? (
              <>
                <Nav.Link as={Link} to="/welcome">Home</Nav.Link>
                
                <NavDropdown title="Transaction" id="transaction-dropdown">
                  <NavDropdown.Item as={Link} to="/requestfund">Request</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/transferfund">Transfer</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/paybills">Pay Bills</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/TransactionHistory">History</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Settings" id="settings-dropdown">
                  <NavDropdown.Item as={Link} to="/banks">Bank List</NavDropdown.Item>
                 
                </NavDropdown>
                <NavDropdown title="Account" id="account-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/accountbank">Bank Accounts</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/contacts">Contacts</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/biller">Biller</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/history">Login History</NavDropdown.Item>
                </NavDropdown>
                <Button variant="outline-primary" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MenuComponent;
