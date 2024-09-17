import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, CircularProgress, Grid, Box, Button } from '@mui/material';

function ViewProfile() {
  const [user, setUser] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const session = JSON.parse(sessionStorage.getItem('user'));

  useEffect(() => {
    if (!session || !session._id) return; // Guard clause to prevent invalid sessions

    // Fetch user data only when session is available and valid
    fetch(`/api/v1/viewUser/${session._id}`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched user data:', data);  // Check the response structure here
        const fetchedUser = data.data.user[0]; // Assuming this is the correct structure
  
        // Initialize states with fetched user data
        setUser(fetchedUser);
        setMobileNumber(fetchedUser.personalInfo?.mobileNumber || ''); // Handle undefined cases
        setFirstName(fetchedUser.personalInfo?.firstName || '');
        setLastName(fetchedUser.personalInfo?.lastName || '');
        setAddress(fetchedUser.personalInfo?.address || '');
      });
  }, [session?._id]);

  const handleSubmit = async (event) => {
    console.log("test");
    event.preventDefault();

    const session = JSON.parse(sessionStorage.getItem('user')); // Ensure session is freshly retrieved
    console.log('Submitting form with session._id:', session?._id);

    if (!session || !session._id) {
      setMessage('Session is invalid or expired.');
      return;
    }

    const requestData = {
      userId: session._id,
      mobileNumber: mobileNumber,
      firstName: firstName,
      lastName: lastName,
      address: address
    };

    console.log('Request Data:', requestData); // Check if the requestData has the correct values

    try {
      const response = await fetch('/api/v1/updateprofile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', // This ensures the backend will receive JSON
        },
        body: JSON.stringify(requestData) // Send data as a JSON string
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(`Failed to update profile: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          View User
        </Typography>
      </Box>
      {message && (
        <Typography variant="body1" color="secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={user.userName}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={user.email}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              value={mobileNumber} // Use the state variable here
              onChange={(e) => setMobileNumber(e.target.value)} // Update state
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={firstName} // Use the state variable here
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={lastName} // Use the state variable here
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Address"
              value={address} // Use the state variable here
              onChange={(e) => setAddress(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Balance"
              value={user.accountInfo?.balance}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Currency"
              value={user.accountInfo?.currency}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Code"
              value={user.accountInfo?.bankcode}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Wallet Address"
              value={user.accountInfo?.walletAddress}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              value={user.accountRoleInfo?.roleName}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>
        </Grid>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Update Profile
        </Button>
      </form>
    </Container>
  );
}

export default ViewProfile;
