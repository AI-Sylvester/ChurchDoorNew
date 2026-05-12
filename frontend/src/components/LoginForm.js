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
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import logo from './logo.png'; // Replace with your actual path

const Login = () => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [anbiyam, setAnbiyam] = useState('');
  const [role, setRole] = useState('family');
  const [familyId, setFamilyId] = useState('');
  const [anbiyamList, setAnbiyamList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnbiyams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/anbiyam/public-list`);
        setAnbiyamList(res.data);
      } catch (err) {
        console.error('Failed to load anbiyams');
      }
    };
    fetchAnbiyams();
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('savedUsername');
    const savedPass = localStorage.getItem('savedPassword');
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setRememberMe(true);
    }
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
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('isAdmin', (res.data.isAdmin || res.data.role === 'admin') ? 'true' : 'false');
        localStorage.setItem('anbiyam', res.data.anbiyam || '');
        localStorage.setItem('familyId', res.data.familyId || '');
        
        if (rememberMe) {
          localStorage.setItem('savedUsername', username);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
        }

        navigate('/home');
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid credentials');
      }
    } else {
      if (!username || !password || !mobile || !anbiyam) {
        setError('All fields are required');
        return;
      }
      if (role === 'incharge' && !familyId) {
        setError('Family ID is mandatory for Incharge registration');
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          username,
          password,
          mobile,
          anbiyam,
          role,
          family_id: familyId,
          email: `${username}@churchdoor.com` // Auto-generate internal email if DB requires it
        });
        setSuccess('Registration successful! Please wait for admin approval.');
        setUsername('');
        setPassword('');
        setMobile('');
        setAnbiyam('');
        setFamilyId('');
        setTimeout(() => setMode('login'), 5000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #312E81 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
          top: '-25%',
          left: '-25%',
          animation: 'pulse 10s infinite alternate',
        },
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        }
      }}
    >
      <Fade in timeout={1000}>
        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 6,
            width: '100%',
            maxWidth: 420,
            textAlign: 'center',
            position: 'relative',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          {/* Logo Section */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-block',
                mb: 2
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: 90,
                  width: 90,
                  borderRadius: '30%',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                  objectFit: 'cover',
                  mx: 'auto',
                  border: '4px solid #fff',
                  transform: 'rotate(-5deg)',
                }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                background: 'linear-gradient(to right, #4F46E5, #818CF8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                mb: 0.5
              }}
            >
              Church Door
            </Typography>
            <Typography variant="body2" color="textSecondary" fontWeight={500}>
              Digital Parish Management
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 3,
              fontWeight: 500,
              color: '#475569',
            }}
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              placeholder={mode === 'login' ? "Username or Mobile Number" : "Username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
              autoComplete="username"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#6366F1' },
                }
              }}
            />

            {mode === 'register' && (
              <Fade in>
                <Box>
                  <TextField
                    placeholder="Mobile Number (Login ID for Families)"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    fullWidth
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#F8FAFC',
                      }
                    }}
                  />
                  <TextField
                    placeholder={role === 'incharge' ? "Family ID (MANDATORY)" : "Family ID (Optional)"}
                    value={familyId}
                    onChange={(e) => setFamilyId(e.target.value)}
                    required={role === 'incharge'}
                    fullWidth
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: '#F8FAFC',
                      }
                    }}
                  />
                  <FormControl fullWidth sx={{ mb: 2, textAlign: 'left' }}>
                    <InputLabel sx={{ color: '#64748B' }}>Register As</InputLabel>
                    <Select
                      value={role}
                      label="Register As"
                      onChange={(e) => setRole(e.target.value)}
                      required
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: '#F8FAFC',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                      }}
                    >
                      <MenuItem value="family">Family Member</MenuItem>
                      <MenuItem value="incharge">Anbiyam Incharge</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ mb: 3, textAlign: 'left' }}>
                    <InputLabel sx={{ color: '#64748B' }}>Select Anbiyam</InputLabel>
                    <Select
                      value={anbiyam}
                      label="Select Anbiyam"
                      onChange={(e) => setAnbiyam(e.target.value)}
                      required
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: '#F8FAFC',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                      }}
                    >
                      {anbiyamList.map((item, idx) => (
                        <MenuItem key={idx} value={item.name}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Fade>
            )}

            <TextField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#6366F1' },
                }
              }}
            />

            <Box sx={{ display: mode === 'login' ? 'flex' : 'none', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }}
                  />
                }
                label={<Typography variant="body2" color="textSecondary" fontWeight={500}>Remember Me</Typography>}
              />
              <Typography variant="body2" sx={{ color: '#6366F1', fontWeight: 600, cursor: 'pointer' }}>
                Forgot?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ 
                py: 1.8, 
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #4F46E5, #6366F1)',
                boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4338CA, #4F46E5)',
                  boxShadow: '0 15px 25px -5px rgba(79, 70, 229, 0.5)',
                }
              }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #F1F5F9' }}>
            <Typography variant="body2" color="textSecondary" mb={2} fontWeight={500}>
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            </Typography>
            <Button
              fullWidth
              variant="text"
              sx={{ 
                py: 1, 
                borderRadius: 3, 
                fontWeight: 700, 
                color: '#4F46E5',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F5F3FF' }
              }}
              onClick={() => {
                setError('');
                setSuccess('');
                setMode(mode === 'login' ? 'register' : 'login');
              }}
            >
              {mode === 'login' ? 'Create New Account' : 'Back to Login'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
