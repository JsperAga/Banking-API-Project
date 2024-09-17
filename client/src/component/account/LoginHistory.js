import React, { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Grid, Box } from '@mui/material';

function ViewLoginHistory() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (session && session._id) {
      fetch(`/api/v1/getAccountHistory/${session._id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.status === 'success') {
            setUser(data.data); // Adjusted to match the provided data structure
          } else {
            throw new Error('Data fetching failed');
          }
        })
        .catch(error => {
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('No session found');
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Login History:
        </Typography>
      </Box>
      <form>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ul>
              {user.loginHistory && user.loginHistory.length > 0 ? (
                user.loginHistory.map(history => (
                  <li key={history._id}>
                    {new Date(history.dateTime).toLocaleString()} - {history.userAgent}
                  </li>
                ))
              ) : (
                <li>No login history</li>
              )}
            </ul>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default ViewLoginHistory;
