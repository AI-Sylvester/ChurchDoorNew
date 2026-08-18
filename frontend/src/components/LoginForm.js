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
  Stack,
  Avatar,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material';
import logo from './logo.png';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [anbiyam, setAnbiyam] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [anbiyamList, setAnbiyamList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    const savedRole = localStorage.getItem('savedRole');
    if (savedUser && savedPass) {
      setUsername(savedUser);
      setPassword(savedPass);
      setSelectedRole(savedRole || 'family');
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
        if (selectedRole && res.data.role !== selectedRole && res.data.role !== 'admin') {
          setError(`This account is not registered as a ${selectedRole}`);
          return;
        }
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('isAdmin', (res.data.isAdmin || res.data.role === 'admin') ? 'true' : 'false');
        localStorage.setItem('anbiyam', res.data.anbiyam || '');
        localStorage.setItem('familyId', res.data.familyId || '');
        if (rememberMe) {
          localStorage.setItem('savedUsername', username);
          localStorage.setItem('savedPassword', password);
          localStorage.setItem('savedRole', selectedRole);
        } else {
          localStorage.removeItem('savedUsername');
          localStorage.removeItem('savedPassword');
          localStorage.removeItem('savedRole');
        }
        navigate('/home');
      } catch (err) {
        if (!err.response) {
          setError('Network error: Cannot reach the server');
        } else {
          setError(err.response.data?.message || 'Invalid credentials');
        }
      }
    } else {
      if (!username || !password || !mobile || !anbiyam) {
        setError('All fields are required');
        return;
      }
      if (selectedRole === 'incharge' && !familyId) {
        setError('Family ID is mandatory for Incharge registration');
        return;
      }
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          username, password, mobile, anbiyam,
          role: selectedRole,
          family_id: familyId,
          email: `${username}@churchdoor.com`
        });
        setSuccess('Registration successful! Please wait for approval.');
        setTimeout(() => { setMode('login'); setSuccess(''); }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  const roles = [
    { role: 'family', label: 'Family User', icon: <GroupsRoundedIcon />, color: '#4F46E5', desc: 'View & manage your family' },
    { role: 'incharge', label: 'Anbiyam Incharge', icon: <ManageAccountsRoundedIcon />, color: '#7C3AED', desc: 'Manage your Anbiyam group' },
    ...(mode === 'login' ? [{ role: 'admin', label: 'Parish Admin', icon: <AdminPanelSettingsRoundedIcon />, color: '#BE123C', desc: 'Full parish management' }] : []),
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1E3A8A 0%, #312E81 60%, #4F46E5 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box sx={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <Fade in timeout={600}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: '#ffffff',
            borderRadius: 5,
            overflow: 'hidden',
            boxShadow: '0 32px 64px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
              px: 3,
              pt: 4,
              pb: 3,
              textAlign: 'center',
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 56,
                width: 56,
                borderRadius: 3,
                mb: 2,
                border: '3px solid rgba(255,255,255,0.3)',
                objectFit: 'cover',
              }}
            />
            <Typography variant="h5" fontWeight={900} color="#fff" sx={{ letterSpacing: '-0.5px' }}>
              Church Door
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {mode === 'login' ? 'Welcome Back' : 'Join Our Parish'}
            </Typography>
          </Box>

          {/* Card Body */}
          <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3, fontSize: '0.85rem' }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2.5, borderRadius: 3, fontSize: '0.85rem' }}>
                {success}
              </Alert>
            )}

            {!selectedRole ? (
              <Fade in>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#64748B" mb={2.5} textAlign="center" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                    Select Your Role
                  </Typography>
                  <Stack spacing={1.5}>
                    {roles.map(({ role, label, icon, color, desc }) => (
                      <Box
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: 3,
                          border: selectedRole === role ? `2px solid ${color}` : '1.5px solid #E2E8F0',
                          bgcolor: selectedRole === role ? `${color}08` : '#FAFAFA',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          '&:active': { transform: 'scale(0.98)' },
                          '&:hover': {
                            borderColor: color,
                            bgcolor: `${color}05`,
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${color}15`,
                            color: color,
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                          }}
                        >
                          {icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                            {label}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                            {desc}
                          </Typography>
                        </Box>
                        {selectedRole === role && (
                          <CheckCircleRoundedIcon sx={{ color, fontSize: 20 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 3 }} />
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary" display="inline">
                      {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="primary"
                      fontWeight={800}
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    >
                      {mode === 'login' ? 'Register' : 'Sign In'}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            ) : (
              <Fade in>
                <Box component="form" onSubmit={handleSubmit}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <IconButton
                      onClick={() => setSelectedRole(null)}
                      size="small"
                      sx={{
                        mr: 1.5,
                        bgcolor: '#F1F5F9',
                        color: '#64748B',
                        '&:hover': { bgcolor: '#E2E8F0' },
                      }}
                    >
                      <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                        {mode === 'login' ? 'Sign in as' : 'Register as'}
                      </Typography>
                      <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                        {selectedRole === 'incharge' ? 'Anbiyam Incharge' : selectedRole === 'admin' ? 'Parish Admin' : 'Family User'}
                      </Typography>
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    placeholder={selectedRole === 'family' ? 'Mobile Number' : 'Username'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 1.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {selectedRole === 'family'
                            ? <PhoneIphoneRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                            : <PersonRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />}
                        </InputAdornment>
                      ),
                    }}
                  />

                  {mode === 'register' && (
                    <>
                      <TextField
                        fullWidth
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        sx={{ mb: 1.5 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIphoneRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        placeholder={selectedRole === 'incharge' ? 'Family ID (Mandatory)' : 'Family ID (Optional)'}
                        value={familyId}
                        onChange={(e) => setFamilyId(e.target.value)}
                        sx={{ mb: 1.5 }}
                      />
                      <FormControl fullWidth sx={{ mb: 1.5 }}>
                        <InputLabel>Select Anbiyam</InputLabel>
                        <Select
                          value={anbiyam}
                          label="Select Anbiyam"
                          onChange={(e) => setAnbiyam(e.target.value)}
                        >
                          {anbiyamList.map((item, idx) => (
                            <MenuItem key={idx} value={item.name}>{item.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </>
                  )}

                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: '#94A3B8' }}
                          >
                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {mode === 'login' && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            size="small"
                            sx={{ color: '#1E3A8A' }}
                          />
                        }
                        label={
                          <Typography variant="caption" fontWeight={700} color="textSecondary">
                            Remember Me
                          </Typography>
                        }
                      />
                    </Box>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #1E3A8A 0%, #4F46E5 100%)',
                      color: '#fff',
                      borderRadius: 3,
                      fontWeight: 900,
                      fontSize: '1rem',
                      py: 1.5,
                      boxShadow: '0 8px 24px rgba(30, 58, 138, 0.35)',
                      '&:hover': {
                        boxShadow: '0 12px 28px rgba(30, 58, 138, 0.45)',
                      },
                    }}
                  >
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>

                  <Box mt={3} textAlign="center">
                    <Typography variant="caption" color="textSecondary">
                      {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="primary"
                      fontWeight={800}
                      sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setSelectedRole(null); }}
                    >
                      {mode === 'login' ? 'Register' : 'Sign In'}
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
