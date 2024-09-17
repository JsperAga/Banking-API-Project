import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, TextField, Button, Box, FormControlLabel, Checkbox, InputLabel, Select, FormControl, MenuItem } from '@mui/material';

function CreateRequestfund() {
  const [accountNumber, setAccountNumber] = useState('');
  const [accountLimit, setAccountLimit] = useState('');
  const [availableFunds, setAvailableFunds] = useState('');
  const [UserBank, setUserBank] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [requestFund, setRequestFund] = useState('');
  const [currency, setCurrency] = useState(''); 
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const session = JSON.parse(sessionStorage.getItem('user'));
  const fileInputRef = useRef(null);
  
  // Fetch account number and limit using userId when the component mounts
  useEffect(() => {
    const fetchAccountNumber = async () => {
      try {
        const response = await fetch(`/api/v1/getaccountnumber/${session._id}`);
        const result = await response.json();
        if (response.ok) {
          setAccountNumber(result.data.accountNumber); // Assuming the API response contains the accountNumber
        } else {
          setMessage(`Failed to fetch account number: ${result.message}`);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    const fetchAccountLimit = async() => {
      try {
        const response = await fetch(`/api/v1/getaccountlimit/${session._id}`);
        const resultLimit = await response.json();
        if (response.ok) {
          setAccountLimit(formatNumber(resultLimit.data.CreditLimit)); // Format the limit when setting it
          setAvailableFunds(formatNumber(resultLimit.data.AvailableFunds));
          setCurrency(resultLimit.data.currency);
        } else {
          setMessage(`Failed to fetch account limit: ${resultLimit.message}`);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    }
    

    const fetchUserBankList = async () => {
      try {
        const response = await fetch(`/api/v1/getuserbank/${session._id}`);
        const resultUserBank = await response.json();
        if (response.ok) {
          setUserBank(resultUserBank.data); // Directly set the array of bank accounts
        } else {
          setMessage(`Failed to fetch account bank: ${resultUserBank.message}`);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    if (session && session._id) {
      fetchAccountNumber();
      fetchAccountLimit();
      fetchUserBankList()
    }
  }, [session]);

  const formatNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleAccountLimitChange = (event) => {
    const { value } = event.target;
    const unformattedValue = value.replace(/,/g, '');
    setAccountLimit(formatNumber(unformattedValue));
  };

  const handleAvailableFundsChange = (event) => {
    const { value } = event.target;
    const unformattedValue = value.replace(/,/g, '');
    setAvailableFunds(formatNumber(unformattedValue));
  };

  const parseNumber = (formattedValue) => {
    if (typeof formattedValue !== 'string') {
      formattedValue = String(formattedValue); // Convert to string if it's not already
    }
    
    const number = parseFloat(formattedValue.replace(/,/g, ''));
  
    if (isNaN(number)) {
      throw new Error(`Invalid number format: ${formattedValue}`);
    }
  
    return number;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    let parsedRequestFund;
    let parsedAvailableFunds;
  
    try {
      parsedRequestFund = parseNumber(requestFund);
      parsedAvailableFunds = parseNumber(availableFunds);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      return; // Stop submission if there's an error
    }
  
    if (parsedRequestFund > parsedAvailableFunds) {
      setMessage(`Error: The amount exceeds your available funds of ${availableFunds} ${currency}`);
      return; // Stop the form submission
    }
  
    //const fundRemain = parsedAvailableFunds - parseFloat(parsedRequestFund);
  
    const formData = new FormData();
    formData.append('userId', session._id);
    formData.append('accountNumber', accountNumber);
    //formData.append('requestFund', parsedRequestFund); 
    formData.append('requestFund', parseNumber(requestFund));
    formData.append('image', image);
    formData.append('bank', selectedBank);
  
    try {
      const response = await fetch('/api/v1/loantransaction', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      if (response.ok) {
        setMessage('Fund request successful!');
        // Clear the form fields
        setAccountNumber('');
        setRequestFund('');
        setImage(null);
        setAgreeToTerms(false);
        setSelectedBank('');
  
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        setMessage(`Failed to request fund: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };
  
  

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Fund Request
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
          <TextField
            fullWidth
            margin="normal"
            label="Credit Limit"
            variant="outlined"
            value={`${currency} ${accountLimit}`}
            onChange={handleAccountLimitChange}
            required
          /> 
          <TextField
            fullWidth
            margin="normal"
            label="Available Funds"
            variant="outlined"
            value={`${currency} ${availableFunds}`}
            onChange={handleAvailableFundsChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Request Fund"
            variant="outlined"
            value={requestFund}
            onChange={(e) => setRequestFund(e.target.value)}
            onBlur={(e) => setRequestFund(formatNumber(e.target.value))} // Format value on blur
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
              {UserBank.map((bank) => (
                <MenuItem key={bank._id} value={bank._id}>
                  {bank.bankName} - {bank.accountNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                name="agreeToTerms"
                color="primary"
              />
            }
            label="I agree to the terms and conditions"
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <Typography variant="body1" sx={{ marginRight: '10px' }}>
              Upload Signature:
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              name="image"
              disabled={!agreeToTerms}
              required
              ref={fileInputRef} // Add the ref here
            />
          </Box>


         


          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={!image}
          >
            Request Fund
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default CreateRequestfund;
