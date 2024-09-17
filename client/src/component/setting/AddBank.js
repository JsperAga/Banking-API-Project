import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

function AddBank() {
  const [bankSwiftCode, setBankSwiftCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankLocation, setBankLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const bankData = {
      bankSwiftCode,
      bankName,
      bankLocation
    };

    try {
      const response = await fetch('/api/v1/createBankInstitution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankData)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Bank added successfully!');
        // Clear the form fields
        setBankSwiftCode('');
        setBankName('');
        setBankLocation('');
      } else {
        setMessage(`Failed to add bank: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Add New Bank
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
            label="Bank Swift Code"
            variant="outlined"
            value={bankSwiftCode}
            onChange={(e) => setBankSwiftCode(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Bank Name"
            variant="outlined"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Bank Location"
            variant="outlined"
            value={bankLocation}
            onChange={(e) => setBankLocation(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Bank
          </Button>
        </form>
        
      </Box>
    </Container>
  );
}

export default AddBank;
