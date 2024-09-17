import React, { useEffect, useState } from 'react';
import { Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Box } from '@mui/material';
import { Link } from 'react-router-dom';

function ViewContacts() {
  const [backendData, setBackendData] = useState([]); // 1. Initialize as an empty array
  
  const session = JSON.parse(sessionStorage.getItem('user'));
  
  useEffect(() => {
    console.log("Fetching users..."); // Debugging log
    
    fetch(`/api/v1/viewContacts/${session._id}`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched users:", data); // Debugging log
        setBackendData(data.data.contacts); // 2. Correctly access and set the contacts data
      });
  }, [session._id]);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', mt: 5 }}>
        <Typography variant="h4" gutterBottom>
            Contacts
        </Typography>
        <Link to="/addContacts" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" color="primary">
            Add New Contacts
          </Typography>
        </Link>
      </Box>
      {backendData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell>Merlin User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backendData.map(contact => ( // 3. Correct iteration over contacts
                <TableRow key={contact._id}>
                  <TableCell>{contact.fullName}</TableCell>
                  <TableCell>{contact.eMail}</TableCell>
                  <TableCell>{contact.mobileNumber || 'N/A'}</TableCell>
                  <TableCell>{contact.isMerlinUser ? "Yes" : "No"}</TableCell>
                  {/* <TableCell>
                    <Link to={`/viewUser/${contact._id}`}>View</Link>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default ViewContacts;
