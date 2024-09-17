import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box,
  Grid,
  Paper,
  CircularProgress
 } from '@mui/material';



function BankList() {
  const [backendData, setBackendData] = useState({ bank: [] });

  useEffect(() => {
    fetch('/api/v1/viewListBank')
      .then(response => response.json())
      .then(data => {
        setBackendData(data.data);
      });
  }, []);

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Bank List
        </Typography>
        <Link to="/addBank" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" color="primary">
            Add New Bank
          </Typography>
        </Link>
      </Box>
      {(backendData.bank.length === 0) ? (
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '50vh' }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {backendData.bank.map(bank => (
            <Grid item xs={12} sm={6} md={4} key={bank._id}>
              <Paper elevation={3} style={{ padding: '16px' }}>
                <Typography variant="h6">
                  Bank Name: {bank.bankName}
                </Typography>
                <Typography variant="body1">
                  <strong>Bank Swift Code:</strong> {bank.bankSwiftCode}
                </Typography>
                <Typography variant="body1">
                  <strong>Bank Location:</strong> {bank.bankLocation}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default BankList;
