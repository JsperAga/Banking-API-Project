import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';

function CreateSendTransact() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');  
  const [selectedContact, setSelectedContact] = useState('');
  const [balance, setBalance] = useState(''); // State to hold the selected bank account's balance
  const [currency, setCurrency] = useState(''); 
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const session = JSON.parse(sessionStorage.getItem('user'));
  const transactionFee = 1.00; // Define the transaction fee

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`/api/v1/viewContacts/${session._id}/etrans`);
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data.data.contacts);
      } catch (error) {
        setMessage(`Failed to fetch contacts: ${error.message}`);
      }
    };
  
    const fetchAccountFunds = async () => {
      try {
        const response = await fetch(`/api/v1/getaccountfund/${session._id}`);
        if (!response.ok) throw new Error('Failed to fetch account funds');
        const data = await response.json();
        setBankAccounts(data.data.accounts);
      } catch (error) {
        setMessage(`Failed to fetch account funds: ${error.message}`);
      }
    };
  
    fetchContacts();
    fetchAccountFunds();
  }, [session]);

  const handleBankSelect = (event) => {
    const selectedBankId = event.target.value;
    setSelectedBank(selectedBankId);
    
    // Find the selected bank account
    const selectedBankAccount = bankAccounts.find(bankAccount => bankAccount._id === selectedBankId);
    
    // Update the balance state with the currentFund of the selected bank account
    if (selectedBankAccount) {
      setBalance(selectedBankAccount.currentFund);
      setCurrency(selectedBankAccount.currency); // Assuming you have a currency field in bankAccount
    }
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  // Find the selected bank account using selectedBank value
  const selectedBankAccount = bankAccounts.find(bankAccount => bankAccount._id === selectedBank);

  if (!selectedBankAccount) {
    setMessage("Error: Selected bank account not found.");
    return;
  }

  const computedTotal = parseFloat(amount) + transactionFee; // Compute the total amount

  if (computedTotal > selectedBankAccount.currentFund) {
    setMessage(`Error: The amount exceeds your available balance of ${selectedBankAccount.currentFund}`);
    return; // Stop the form submission
  }

  const eTransferData = {
    type: "66c7b589da3364306d2884ba",
    amount: parseFloat(amount), // Use the parsed amount
    status: "Approve",
    fee: transactionFee,
    description,
    recipientName: "",
    from_account: session._id,
    from_account_number: selectedBankAccount.accountNumber,
    to_account: selectedContact
  };

  try {
    const response = await fetch('/api/v1/createSendeTransfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eTransferData)
    });

    const result = await response.json();
    if (response.ok) {
      setMessage('eTransfer successfully sent!');
      setAmount('');
      setDescription('');
      setSelectedContact('');
      setSelectedBank('');
      setBalance('');
    } else {
      setMessage(`Failed to send eTransfer: ${result.message}`);
    }
  } catch (error) {
    setMessage(`Error: ${error.message}`);
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', mt: 5 }}>
          <Typography variant="h4" gutterBottom>
            Send eTransfer
          </Typography>
          <Link to="/addcontacts" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" color="primary">
              Add Contacts
            </Typography>
          </Link>
        </Box>
        {message && (
          <Typography variant="body1" color="secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Balance: {balance} {currency}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="select-contact-label">Select Bank Account</InputLabel>
            <Select
              labelId="select-contact-label"
              value={selectedBank}
              onChange={handleBankSelect} // Update the onChange handler
              required
            >
              {Array.isArray(bankAccounts) && bankAccounts.map((bankAccount) => (
                <MenuItem key={bankAccount._id} value={bankAccount._id}>
                  {bankAccount.accountNumber} - {bankAccount.accountType} - CAD {bankAccount.currentFund}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-contact-label">Select Contact</InputLabel>
            <Select
              labelId="select-contact-label"
              value={selectedContact}
              onChange={(e) => setSelectedContact(e.target.value)}
              required
            >
              {contacts.map((contact) => (
                <MenuItem key={contact._id} value={contact.contactId ? contact.contactId : contact._id}>
                  {contact.fullName} 
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Amount"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            variant="outlined"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Typography variant="h7" gutterBottom>
            Processing fee: {transactionFee} {currency}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Total: {amount ? (parseFloat(amount) + transactionFee).toFixed(2) : '0.00'} {currency}
          </Typography>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Send
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default CreateSendTransact;
