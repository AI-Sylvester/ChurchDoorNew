import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Fade,
  Stack,
} from '@mui/material';
import logo from './logo.png'; // Replace with your actual path

const Login = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
        setShowButtons(true);
        setTimeout(() => setShowButtons(false), 60000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          username,
          password,
        });
        localStorage.setItem('token', res.data.token);
        navigate('/home');
      } catch {
        setError('Invalid credentials');
      }
    } else {
      if (!email) {
        setError('Email is required');
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          username,
          password,
          email,
        });
        setSuccess('User created successfully! Please login.');
        setUsername('');
        setPassword('');
        setEmail('');
        setMode('login');
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(to bottom right, #fdfdfd, #f7f7ef)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Fade in>
        <Box
          sx={{
            bgcolor: '#fff',
            p: { xs: 3, sm: 4 },
           
            boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
            width: '100%',
            maxWidth: 360,
            textAlign: 'center',
            position: 'relative',
        
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 70,
                width: 70,
                borderRadius: '50%',
                border: '3px solid #f7e600',
                objectFit: 'cover',
                mx: 'auto',
                mb: 1,
              }}
            />
      <Typography
  variant="h4"
  sx={{
    fontWeight: 400,
    fontFamily: "'Cinzel', serif",
    color: '#2C3E50',

  }}
>
  Church Door
</Typography>
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: '#666',
              fontSize: '0.95rem',
            }}
          >
            {mode === 'login' ? 'Login ' : 'Register'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoComplete="username"
              sx={{ mb: 2 }}
            />

            {mode === 'register' && (
              <TextField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#f7e600',
                color: '#000',
                fontWeight: 700,
                py: 1.4,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#e6d900',
                },
              }}
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </Box>

          {showButtons && (
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setMode(mode === 'login' ? 'register' : 'login');
                }}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#f7e600',
                  color: '#333',
                  fontWeight: 600,
                  py: 1.3,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(247, 230, 0, 0.08)',
                  },
                }}
              >
                {mode === 'login' ? 'Create new account' : 'Back to login'}
              </Button>

              <Button
                onClick={() => setShowButtons(false)}
                variant="text"
                fullWidth
                sx={{
                  color: '#888',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#444',
                  },
                }}
              >
                Hide Controls
              </Button>
            </Stack>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
