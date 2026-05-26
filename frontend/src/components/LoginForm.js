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
  Card,
  Stack,
  Avatar,
  IconButton,
  InputAdornment
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

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [selectedRole, setSelectedRole] = useState(null); // 'family', 'incharge', 'admin'
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
        const res = await axios.post(`${API_BASE_URL}/auth/login`, {
          username, // This can be mobile or username
          password,
        });
        
        // Verify role match if needed (optional security layer)
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
        setError(err.response?.data?.message || 'Invalid credentials');
      }
    } else {
      // Registration Logic
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
          username,
          password,
          mobile,
          anbiyam,
          role: selectedRole,
          family_id: familyId,
          email: `${username}@churchdoor.com`
        });
        setSuccess('Registration successful! Please wait for approval.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  const RoleCard = ({ role, label, icon, color }) => (
    <Card
      onClick={() => setSelectedRole(role)}
      sx={{
        p: 2,
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 4,
        border: selectedRole === role ? `2px solid ${color}` : '2px solid transparent',
        bgcolor: selectedRole === role ? `${color}08` : '#fff',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
          borderColor: selectedRole === role ? color : '#E2E8F0'
        }
      }}
      elevation={0}
    >
      <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 48, height: 48 }}>
        {icon}
      </Avatar>
      <Typography variant="subtitle1" fontWeight={800} color={selectedRole === role ? color : '#1E293B'}>
        {label}
      </Typography>
    </Card>
  );

  return (
    <Box
      sx={{
        height: '100vh',
        background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        overflowY: 'auto'
      }}
    >
      <Fade in timeout={800}>
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 6,
            width: '100%',
            maxWidth: 420,
            my: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box component="img" src={logo} alt="Logo" sx={{ height: 60, width: 60, mb: 1.5, borderRadius: '20%' }} />
            <Typography variant="h5" fontWeight={900} color="#1E3A8A" sx={{ letterSpacing: '-1px' }}>
              Church Door
            </Typography>
            <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {mode === 'login' ? 'Welcome Back' : 'Join Our Parish'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}

          {!selectedRole ? (
            <Fade in>
              <Box>
                <Typography variant="body1" fontWeight={800} color="#475569" mb={3} textAlign="center">
                  Select Your Role
                </Typography>
                <Stack spacing={2}>
                  <RoleCard role="family" label="Family User" icon={<GroupsRoundedIcon />} color="#4F46E5" />
                  <RoleCard role="incharge" label="Anbiyam Incharge" icon={<ManageAccountsRoundedIcon />} color="#7C3AED" />
                  {mode === 'login' && (
                    <RoleCard role="admin" label="Parish Admin" icon={<AdminPanelSettingsRoundedIcon />} color="#BE123C" />
                  )}
                </Stack>
                <Box mt={4} pt={3} borderTop="1px solid #F1F5F9" textAlign="center">
                  <Button
                    variant="text"
                    sx={{ fontWeight: 800, textTransform: 'none' }}
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  >
                    {mode === 'login' ? 'Need to register?' : 'Already have an account?'}
                  </Button>
                </Box>
              </Box>
            </Fade>
          ) : (
            <Fade in>
              <Box component="form" onSubmit={handleSubmit}>
                <Box display="flex" alignItems="center" mb={3}>
                  <IconButton onClick={() => setSelectedRole(null)} sx={{ mr: 1, bgcolor: '#F8FAFC' }}>
                    <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={800} color="textSecondary">
                    {mode === 'login' ? 'Login as' : 'Register as'} {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </Typography>
                </Box>

                {/* Shared Login/Register Fields */}
                <TextField
                  fullWidth
                  placeholder={selectedRole === 'family' ? 'Mobile Number' : 'Username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {selectedRole === 'family' ? <PhoneIphoneRoundedIcon sx={{ color: '#94A3B8' }} /> : <PersonRoundedIcon sx={{ color: '#94A3B8' }} />}
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
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                    />
                    <TextField
                      fullWidth
                      placeholder={selectedRole === 'incharge' ? 'Family ID (Mandatory)' : 'Family ID (Optional)'}
                      value={familyId}
                      onChange={(e) => setFamilyId(e.target.value)}
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Select Anbiyam</InputLabel>
                      <Select
                        value={anbiyam}
                        label="Select Anbiyam"
                        onChange={(e) => setAnbiyam(e.target.value)}
                        sx={{ borderRadius: 3, bgcolor: '#F8FAFC' }}
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
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#F8FAFC' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {mode === 'login' && (
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <FormControlLabel
                      control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />}
                      label={<Typography variant="caption" fontWeight={700} color="textSecondary">Remember Me</Typography>}
                    />
                    <Typography variant="caption" fontWeight={800} color="primary" sx={{ cursor: 'pointer' }}>Forgot?</Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 3, 
                    fontWeight: 900, 
                    fontSize: '1rem', 
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #4F46E5, #6366F1)',
                    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </Box>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default Login;
