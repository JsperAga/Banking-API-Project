import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

function AddContacts() {
  const [fullName, setfullName] = useState('');
  const [eMail, seteMail] = useState('');
  const [mobileNumber, setmobileNumber] = useState('');
  const [message, setMessage] = useState('');
  const session = JSON.parse(sessionStorage.getItem('user'));
  const userId = session._id;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const ContactsData = {
        userId,
        fullName,
        eMail,
        mobileNumber     
    };

    try {
      const response = await fetch('/api/v1/createContacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ContactsData)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Contacts added successfully!');
        // Clear the form fields
        setfullName('');
        seteMail(''); 
        setmobileNumber('');
      } else {
        setMessage(`Failed to add contacts: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBott
        om>
          Add New Contacts
        </Typography>
        {message && (
          <Typography variant="body1" color="secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Full name"
            variant="outlined"
            value={fullName}
            onChange={(e) => setfullName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            variant="outlined"
            value={eMail}
            onChange={(e) => seteMail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mobile Number"
            variant="outlined"
            value={mobileNumber}
            onChange={(e) => setmobileNumber(e.target.value)}
            required
          />          
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Contacts
          </Button>
        </form>
        
      </Box>
    </Container>
  );
}

export default AddContacts;
