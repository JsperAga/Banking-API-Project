import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ContactsIcon from '@mui/icons-material/Contacts';

function Welcome() {
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          padding: 4,
          backgroundColor: 'white',
          boxShadow: 3,
          borderRadius: 2,
          textAlign: 'center',
          width: '80%',
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HomeIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                  Home
                </Typography>
              </Box>
            </Link>
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/requestfund" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <RequestQuoteIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                 Transaction Request
                </Typography>
              </Box>
            </Link>
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/banks" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AccountBalanceIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                  Bank List
                </Typography>
              </Box>
            </Link>
          </Grid>
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/TransactionHistory" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <HistoryIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                  Transaction History
                </Typography>
              </Box>
            </Link>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/accountbank" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <LibraryBooksIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                  Bank Accounts
                </Typography>
              </Box>
            </Link>
          </Grid>

          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to="/contacts" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ContactsIcon sx={{ fontSize: 60, color: '#546d4c' }} />
                <Typography variant="body1" color="textPrimary">
                  Bank Accounts
                </Typography>
              </Box>
            </Link>
          </Grid>
          
          
         
        </Grid>
      </Box>
    </Box>
  );
}

export default Welcome;
