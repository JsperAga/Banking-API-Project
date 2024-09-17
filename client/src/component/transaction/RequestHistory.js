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
import { format } from 'date-fns';

function ViewContacts() {
  const [backendData, setBackendData] = useState([]); // 1. Initialize as an empty array
  //const [error, setError] = useState(null); // State to handle errors
  const session = JSON.parse(sessionStorage.getItem('user'));

  const formatNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    //console.log("Fetching users..."); // Debugging log
    
    fetch(`/api/v1/getTransactionHistory/${session._id}`)
      .then(response => response.json())
      .then(data => {
        //console.log("Fetched users:", data); // Debugging log
        setBackendData(data.data.transactions); // 2. Correctly access and set the contacts data
      })
      .catch(error => {
        console.error("Error fetching transaction:", error); // Error handling log
      });
  }, [session]);


  const getCellColor = (transactions) => {
    if (
      (transactions.transactionInfo.type === "Credit" && transactions.user === session._id) ||
      (transactions.transactionInfo.type === "Transfer" && transactions.user === session._id)
    ) {
      return 'red';
    } else if (
      transactions.transactionInfo.type === "Transfer" && 
      transactions.bankInfo.user === session._id
    ) {
      return 'green';
    } else {
      return 'black'; // Default color if none of the conditions match
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', mt: 5 }}>
        <Typography variant="h4" gutterBottom>
            Transactions
        </Typography>
        <Link to="/requestfund" style={{ textDecoration: 'none' }}>
          <Typography variant="h6" color="primary">
            Request Fund
          </Typography>
        </Link>
      </Box>
      {backendData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress /> No records found
        </div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>  
                <TableCell>Request Account</TableCell>                          
                <TableCell>Bank Name</TableCell>   
                <TableCell>Transfer fund to</TableCell>   
                <TableCell>Request Fund</TableCell>                                
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backendData.map(transactions => ( // 3. Correct iteration over contacts
                <TableRow key={transactions._id}>
                    <TableCell>{transactions.transactionInfo.type}</TableCell>
                    <TableCell>{transactions.accountNumber}</TableCell>         
                    <TableCell>{transactions.bankInfoName.bankName}</TableCell>  
                    <TableCell>{transactions.bankInfo.accountNumber}</TableCell>  
                    
                    <TableCell style={{ color: getCellColor(transactions) }}>
                      CAD {formatNumber(transactions.requestFund)}
                    </TableCell>
                                                  
                    <TableCell>{format(new Date(transactions.dateTime), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
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
