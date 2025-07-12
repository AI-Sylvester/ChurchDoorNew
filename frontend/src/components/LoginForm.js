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
        background: 'linear-gradient(to bottom right, #fdfdfd, #c5c5be)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
      }}
    >
      <Fade in>
        <Box
          sx={{
            bgcolor: '#ffffff',
            p: 4,
            borderRadius: 4,
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            width: { xs: '90%', sm: 400 },
            textAlign: 'center',
            borderTop: '5px solid #c5c5be',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, color: '#2C3E50' }}
          >
            Church Door
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: '#8B1A1A',
              fontSize: '1rem',
            }}
          >
            {mode === 'login' ? 'Login to continue' : 'Create a new account'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <TextField
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#c5c5be',
                    boxShadow: '0 0 6px #c5c5be',
                  },
                },
              }}
            />

            {mode === 'register' && (
              <TextField
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused fieldset': {
                      borderColor: '#c5c5be',
                      boxShadow: '0 0 6px #c5c5be',
                    },
                  },
                }}
              />
            )}

            <TextField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              fullWidth
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': {
                    borderColor: '#c5c5be',
                    boxShadow: '0 0 6px #c5c5be',
                  },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#8c8c89',
                fontWeight: 600,
                py: 1.4,
                borderRadius: 2,
                fontSize: '0.95rem',
                '&:hover': {
                  bgcolor: '#6f6f6d',
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
                  borderColor: '#c5c5be',
                  color: '#2C3E50',
                  fontWeight: 600,
                  py: 1.3,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#8B1A1A',
                    color: '#8B1A1A',
                    bgcolor: 'rgba(139, 26, 26, 0.05)',
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
                  color: '#666',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#333',
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
