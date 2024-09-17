import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      userName,
      password
    };

    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      //console.log("Login response:", result); // Debugging log

      if (response.ok) {
        const user = {
          userName: result.data.user.userName,
          _id: result.data.user._id
        };
        sessionStorage.setItem('user', JSON.stringify(user));
        //console.log("User stored in session storage:", user); // Debugging log

        if (result.data.checkPersonal.lock === 0 || result.data.checkPersonal.lock == null) {
 
          navigate('/profile');
        } else {
          navigate('/welcome');
        }
        
      } else {
        setMessage(`Login failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Login
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
            label="Username"
            variant="outlined"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            autoComplete="off"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button type="submit" variant="contained" color="primary" >
              Login
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/forgotpassword')}
            >
              Forget Password
            </Button>
          </Box>
        </form>
       
      </Box>
    </Container>
  );
}

export default Login;
