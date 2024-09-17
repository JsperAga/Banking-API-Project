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
    
    fetch(`/api/v1/getAccountBank/${session._id}`)
      .then(response => response.json())
      .then(data => {
        console.log("Fetched users:", data); // Debugging log
        setBackendData(data.data.BankAccount); // 2. Correctly access and set the contacts data
      });
  }, [session._id]);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', mt: 5 }}>
        <Typography variant="h4" gutterBottom>
            Account Bank
        </Typography>
        <Link to="/addaccountbank" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" color="primary">
            Add New Account
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
                <TableCell>Account Number</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backendData.map(BankAccount => ( // 3. Correct iteration over contacts
                <TableRow key={BankAccount._id}>
                  <TableCell>{BankAccount.accountNumber}</TableCell>
                  <TableCell>{BankAccount.bankInfoName.bankName}</TableCell>
                  <TableCell>{BankAccount.accountType}</TableCell>
                  <TableCell>{BankAccount.currentFund}</TableCell>
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
