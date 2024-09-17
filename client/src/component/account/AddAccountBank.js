import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function AddContacts() {
  const [accountNumber, setAccountNumber] = useState('');  
  const [bank, setBank] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const session = JSON.parse(sessionStorage.getItem('user'));
  const userId = session._id;

  useEffect(() => {
    
    const fetchBankList = async () => {
        try {
            const response = await fetch(`/api/v1/viewListBank`);
            const resultBankList = await response.json();
            if (response.ok) {
                setBank(resultBankList.data.bank); // Correctly set the array of bank accounts
            } else {
                setMessage(`Failed to fetch bank list: ${resultBankList.message}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    if (session && session._id) {
        fetchBankList();
    }
  }, [session]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const BankAccountData = {
        userId,
        accountNumber,
        bank: selectedBank, // Use the selectedBank value,
        accountType: selectedAccountType
    };

    try {
      const response = await fetch('/api/v1/CreateAccountBank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(BankAccountData)
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Account bank added successfully!');
        // Clear the form fields
        setAccountNumber('');
        setSelectedBank(''); // Clear the selected bank
        setSelectedAccountType('');
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
            label="Account Number"
            variant="outlined"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
         
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-contact-label">Select Bank Account</InputLabel>
            <Select
              labelId="select-contact-label"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              required
            >
                {bank.map((bank) => (
                    <MenuItem key={bank._id} value={bank._id}>
                        {bank.bankName}
                    </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-contact-label">Select Account Typet</InputLabel>
            <Select
              labelId="select-contact-label"
              value={selectedAccountType}
              onChange={(e) => setSelectedAccountType(e.target.value)}
              required
            >
                
                    <MenuItem key='Chequing' value='Chequing'>
                        Chequing
                    </MenuItem>
                    <MenuItem key='Credit' value='Credit'>
                        Credit
                    </MenuItem>
                
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Account
          </Button>
        </form>
        
      </Box>
    </Container>
  );
}

export default AddContacts;
