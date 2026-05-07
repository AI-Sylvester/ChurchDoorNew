import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, 
  Typography, Checkbox, FormControlLabel, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, InputAdornment, 
  Autocomplete, Paper, Fade, Avatar, Stack
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoomIcon from '@mui/icons-material/Room';
import API_BASE_URL from '../config';
import MapSelector from './Mapselector';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';

const AddFamily = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'family';
  const userAnbiyam = localStorage.getItem('anbiyam');

  const initialForm = {
    head_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    pincode: '',
    mobile_number: '',
    mobile_number2: '',
    cemetery: 'no',
    native: '',
    resident_from: '',
    house_type: 'Own',
    subscription: '',
    anbiyam: userAnbiyam || '', // Default to user's assigned anbiyam
    family_pic: '',
    cemetery_number: '',
    old_card_number: '',
    active: role === 'admin', // Auto-active for admin only
    location: ''
  };

  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [anbiyamList, setAnbiyamList] = useState([]);
  const [family, setFamily] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    const fetchAnbiyamList = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/anbiyam`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnbiyamList(res.data);
      } catch (err) {
        console.error('Failed to fetch anbiyam list', err);
      }
    };
    if (token) fetchAnbiyamList();
  }, [token]);

  const createFamily = async () => {
    if (!form.head_name) {
      setError('Head Name is required');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (file) {
      formData.append('family_pic', file);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/family/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setFamily(res.data);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError('Failed to create family. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };


  if (family) {
    return (
      <Fade in timeout={800}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2, textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: 5, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#10B98115', color: '#10B981', mx: 'auto', mb: 3 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" gutterBottom>Success!</Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Your family record has been created successfully. 
              {role === 'family' ? ' It will now be reviewed by your Anbiyam Incharge.' : ''}
            </Typography>
            
            <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 5, mb: 4, border: '1px solid #F1F5F9' }}>
              <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Family ID</Typography>
              <Typography variant="h5" fontWeight={900} color="#1E3A8A">{family.family_id}</Typography>
            </Box>

            <Stack spacing={2}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<GroupAddRoundedIcon />}
                onClick={() => navigate(`/add-member?family_id=${family.family_id}`)}
                sx={{ py: 2, borderRadius: 4, fontWeight: 900, bgcolor: '#1E3A8A', boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}
              >
                Add Family Members
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/home')}
                sx={{ py: 2, borderRadius: 4, fontWeight: 800, color: '#64748B', borderColor: '#E2E8F0' }}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#1E3A8A', color: '#fff', mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}>
            <HomeWorkRoundedIcon />
          </Avatar>
          <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px' }}>
            Register Your Family
          </Typography>
          <Typography variant="body2" color="textSecondary" fontWeight={500}>
            Submit your family details for parish records
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Primary Information
          </Typography>
          
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Head Name*" name="head_name" value={form.head_name} onChange={handleChange} fullWidth variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={anbiyamList.map((item) => item.name)}
                value={form.anbiyam || null}
                onChange={(e, v) => setForm(p => ({ ...p, anbiyam: v || '' }))}
                renderInput={(params) => <TextField {...params} label="Anbiyam Group" />}
                disabled={role === 'family' && !!userAnbiyam}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Mobile Number*" name="mobile_number" value={form.mobile_number} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Alternate Mobile" name="mobile_number2" value={form.mobile_number2} onChange={handleChange} fullWidth />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Address & Location
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField label="Address Line 1" name="address_line1" value={form.address_line1} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField label="Address Line 2" name="address_line2" value={form.address_line2} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location Pin"
                name="location"
                value={form.location}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setMapDialogOpen(true)} color="primary"><RoomIcon /></IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Additional Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>House Type</InputLabel>
                <Select name="house_type" value={form.house_type} onChange={handleChange} label="House Type">
                  <MenuItem value="Own">Own</MenuItem>
                  <MenuItem value="Rental">Rental</MenuItem>
                  <MenuItem value="Lease">Lease</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Cemetery</InputLabel>
                <Select name="cemetery" value={form.cemetery} onChange={handleChange} label="Cemetery">
                  <MenuItem value="no">No</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Resident From (Year)" name="resident_from" value={form.resident_from} onChange={handleChange} fullWidth />
            </Grid>
            
            <Grid item xs={12}>
               <Box sx={{ mt: 2, p: 3, border: '2px dashed #E2E8F0', borderRadius: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
                {previewUrl ? (
                  <Box>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }} />
                    <Button variant="outlined" component="label" sx={{ borderRadius: 2, textTransform: 'none' }}>
                      Change Photo
                      <input type="file" accept="image/*" hidden onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) { setFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                      }} />
                    </Button>
                  </Box>
                ) : (
                  <Button variant="text" component="label" sx={{ py: 3, width: '100%', textTransform: 'none' }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="body1" fontWeight={700} color="#1E3A8A">Upload Family Photo</Typography>
                      <Typography variant="caption" color="textSecondary">Tap to browse gallery or take a picture</Typography>
                    </Stack>
                    <input type="file" accept="image/*" hidden onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                    }} />
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {role === 'admin' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#FFFBEB', borderRadius: 3, border: '1px solid #FEF3C7' }}>
              <FormControlLabel
                control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="warning" />}
                label={<Typography fontWeight={700} color="#92400E">Mark as Active Immediately</Typography>}
              />
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={createFamily}
            disabled={submitting}
            sx={{ 
              mt: 5, py: 2.5, borderRadius: 4, fontWeight: 900, 
              bgcolor: '#1E3A8A', 
              boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
              '&:hover': { bgcolor: '#1e3a8a', boxShadow: '0 12px 32px rgba(30, 58, 138, 0.3)' }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
          </Button>
        </Paper>
      </Box>

      <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Select Location</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 400 }}>
            <MapSelector value={form.location} onChange={(loc) => setForm(p => ({ ...p, location: loc }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setMapDialogOpen(false)} variant="contained" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }}>Save Location</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddFamily;

const Grid = ({ children, container, item, spacing, xs, sm, md, sx }) => (
  <Box sx={{ 
    ...(container && { display: 'flex', flexWrap: 'wrap', m: spacing ? -(spacing * 4) / 2 : 0 }),
    ...(item && { 
      p: spacing ? (spacing * 4) / 2 : 0, 
      width: xs ? `${(xs / 12) * 100}%` : 'auto',
      ...(sm && { '@media (min-width: 600px)': { width: `${(sm / 12) * 100}%` } })
    }),
    ...sx 
  }}>
    {children}
  </Box>
);

const Alert = ({ children, severity, sx }) => (
  <Box sx={{ p: 2, borderRadius: 2, bgcolor: severity === 'error' ? '#FEF2F2' : '#F0FDF4', color: severity === 'error' ? '#991B1B' : '#166534', border: `1px solid ${severity === 'error' ? '#FEE2E2' : '#DCFCE7'}`, ...sx }}>
    <Typography variant="body2" fontWeight={700}>{children}</Typography>
  </Box>
);

const CircularProgress = ({ size, color }) => (
  <Box sx={{ width: size, height: size, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </Box>
);
