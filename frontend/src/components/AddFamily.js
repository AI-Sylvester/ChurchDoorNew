import React, { useState, useEffect } from 'react';
import {
  Box, TextField, MenuItem, FormControl, InputLabel, Select, Button, 
  Typography, Checkbox, FormControlLabel, Dialog, 
  DialogContent, DialogActions, IconButton, InputAdornment, 
  Autocomplete, Paper, Fade, Avatar, Stack, CircularProgress,
  Alert, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoomIcon from '@mui/icons-material/Room';
import API_BASE_URL from '../config';
import MapSelector from './Mapselector';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import ContactPhoneRoundedIcon from '@mui/icons-material/ContactPhoneRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import { useParams } from 'react-router-dom';

const AddFamily = ({ isEdit = false }) => {
  const { familyId: editFamilyId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();
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
    anbiyam: userAnbiyam || '',
    family_pic: '',
    cemetery_number: '',
    old_card_number: '',
    active: role === 'admin',
    location: ''
  };

  const [activeStep, setActiveStep] = useState(0);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [anbiyamList, setAnbiyamList] = useState([]);
  const [family, setFamily] = useState(null);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

    const fetchExistingData = async () => {
      if (!isEdit || !editFamilyId) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/family/${editFamilyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = res.data;
        
        // If already approved and user is not admin, block edit
        if (d.active && role !== 'admin') {
          setError('This record is approved and locked. Please request an update from your profile.');
          return;
        }

        setForm({
          head_name: d.head_name || '',
          address_line1: d.address_line1 || '',
          address_line2: d.address_line2 || '',
          city: d.city || '',
          pincode: d.pincode || '',
          mobile_number: d.mobile_number || '',
          mobile_number2: d.mobile_number2 || '',
          cemetery: d.cemetery || 'no',
          native: d.native || '',
          resident_from: d.resident_from || '',
          house_type: d.house_type || 'Own',
          subscription: d.subscription || '',
          anbiyam: d.anbiyam || '',
          family_pic: d.family_pic || '',
          cemetery_number: d.cemetery_number || '',
          old_card_number: d.old_card_number || '',
          active: d.active || false,
          location: d.location || ''
        });
        if (d.family_pic) setPreviewUrl(d.family_pic);
      } catch (err) {
        setError('Failed to load family data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnbiyamList();
      fetchExistingData();
    }
  }, [token, isEdit, editFamilyId, role]);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !form.head_name) {
      setError('Head Name is required');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const createFamily = async () => {
    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (file) {
      formData.append('family_pic', file);
    }

    try {
      const url = isEdit ? `${API_BASE_URL}/family/${editFamilyId}` : `${API_BASE_URL}/family/create`;
      const method = isEdit ? 'put' : 'post';
      
      const res = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (isEdit) {
        navigate('/home'); // Or back to family list
      } else {
        setFamily(res.data);
      }
      setError('');
    } catch (err) {
      setError(isEdit ? 'Failed to update family.' : 'Failed to create family. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (family) {
    return (
      <Fade in timeout={800}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2, textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#10B98115', color: '#10B981', mx: 'auto', mb: 3 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" gutterBottom sx={{ letterSpacing: '-1px' }}>Registration Complete!</Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Your family record has been created successfully. 
              {role === 'family' ? ' It will now be reviewed by your Anbiyam Incharge.' : ''}
            </Typography>
            
            <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: 5, mb: 4, border: '1px solid #F1F5F9' }}>
              <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Family ID Generated</Typography>
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
                Finish Later
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  const steps = [
    {
      label: 'Primary Info',
      icon: <ContactPhoneRoundedIcon />,
      content: (
        <Stack spacing={2.5}>
          <TextField label="Head Name*" name="head_name" value={form.head_name} onChange={handleChange} fullWidth variant="outlined" placeholder="Full name of family head" />
          <Autocomplete
            options={anbiyamList.map((item) => item.name)}
            value={form.anbiyam || null}
            onChange={(e, v) => setForm(p => ({ ...p, anbiyam: v || '' }))}
            renderInput={(params) => <TextField {...params} label="Anbiyam Group" />}
            disabled={role === 'family' && !!userAnbiyam}
          />
          <TextField label="Mobile Number*" name="mobile_number" value={form.mobile_number} onChange={handleChange} fullWidth placeholder="Main contact number" />
          <TextField label="Alternate Mobile" name="mobile_number2" value={form.mobile_number2} onChange={handleChange} fullWidth />
        </Stack>
      )
    },
    {
      label: 'Location Details',
      icon: <MapRoundedIcon />,
      content: (
        <Stack spacing={2.5}>
          <TextField label="Address Line 1" name="address_line1" value={form.address_line1} onChange={handleChange} fullWidth placeholder="House No / Door No" />
          <TextField label="Address Line 2" name="address_line2" value={form.address_line2} onChange={handleChange} fullWidth placeholder="Street / Area Name" />
          <Stack direction="row" spacing={2}>
            <TextField label="City" name="city" value={form.city} onChange={handleChange} sx={{ flex: 1 }} />
            <TextField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} sx={{ flex: 1 }} />
          </Stack>
          <TextField
            label="Geo Location Pin"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setMapDialogOpen(true)} color="primary" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)' }}>
                    <RoomIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="Tap the map icon to pick your house location"
          />
        </Stack>
      )
    },
    {
      label: 'Parish Info',
      icon: <InfoRoundedIcon />,
      content: (
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>House Type</InputLabel>
              <Select name="house_type" value={form.house_type} onChange={handleChange} label="House Type">
                <MenuItem value="Own">Own</MenuItem>
                <MenuItem value="Rental">Rental</MenuItem>
                <MenuItem value="Lease">Lease</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Cemetery</InputLabel>
              <Select name="cemetery" value={form.cemetery} onChange={handleChange} label="Cemetery">
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField label="Resident From (Year)" name="resident_from" value={form.resident_from} onChange={handleChange} fullWidth placeholder="e.g. 1995" />
          <TextField label="Native Place" name="native" value={form.native} onChange={handleChange} fullWidth />
        </Stack>
      )
    },
    {
      label: 'Media & Status',
      icon: <PhotoCameraRoundedIcon />,
      content: (
        <Stack spacing={3}>
          <Box sx={{ p: 3, border: '2px dashed #CBD5E1', borderRadius: 5, textAlign: 'center', bgcolor: '#F8FAFC' }}>
            {previewUrl ? (
              <Box>
                <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 16, marginBottom: 16, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                <Button variant="outlined" component="label" sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}>
                  Replace Photo
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                  }} />
                </Button>
              </Box>
            ) : (
              <Button variant="text" component="label" sx={{ py: 4, width: '100%', textTransform: 'none' }}>
                <Stack spacing={2} alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(30, 58, 138, 0.1)', color: '#1E3A8A' }}>
                    <PhotoCameraRoundedIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={900} color="#1E293B">Upload Family Photo</Typography>
                    <Typography variant="caption" color="#64748B" fontWeight={600}>Tap to take a picture or choose from gallery</Typography>
                  </Box>
                </Stack>
                <input type="file" accept="image/*" hidden onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) { setFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                }} />
              </Button>
            )}
          </Box>
          
          {role === 'admin' && (
            <Paper sx={{ p: 2, bgcolor: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: 4 }} elevation={0}>
              <FormControlLabel
                control={<Checkbox name="active" checked={form.active} onChange={handleChange} color="warning" />}
                label={<Typography fontWeight={800} color="#854D0E" variant="body2">Activate this record immediately</Typography>}
              />
            </Paper>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F1F5F9', minHeight: '100vh', pb: 12 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#1E3A8A', color: '#fff', mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}>
            <HomeWorkRoundedIcon />
          </Avatar>
          <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px', mb: 0.5 }}>
            {isEdit ? 'Update Registration' : 'New Registration'}
          </Typography>
          <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
            {isEdit ? 'Modify your family details' : 'Complete the steps below to register'}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 4, fontWeight: 700 }}>{error}</Alert>}
            <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', opacity: (error && isEdit) ? 0.5 : 1, pointerEvents: (error && isEdit) ? 'none' : 'auto' }}>
              <Stepper activeStep={activeStep} orientation="vertical" sx={{ 
                '& .MuiStepIcon-root': { width: 32, height: 32 },
                '& .MuiStepIcon-root.Mui-active': { color: '#1E3A8A' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#10B981' }
              }}>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel icon={index < activeStep ? <CheckCircleRoundedIcon /> : undefined}>
                      <Typography variant="subtitle1" fontWeight={900} color={activeStep === index ? '#1E293B' : '#94A3B8'}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mt: 2, mb: 3 }}>
                        {step.content}
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            onClick={index === steps.length - 1 ? createFamily : handleNext}
                            disabled={submitting}
                            sx={{ 
                              borderRadius: 3, px: 4, py: 1.5, fontWeight: 900, textTransform: 'none',
                              bgcolor: '#1E3A8A', '&:hover': { bgcolor: '#1e3a8a' }
                            }}
                          >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : index === steps.length - 1 ? (isEdit ? 'Update Record' : 'Finish Registration') : 'Continue'}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', color: '#64748B' }}
                          >
                            Back
                          </Button>
                        </Stack>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </>
        )}
      </Box>

      <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 5 } }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9' }}>
          <Typography variant="h6" fontWeight={900}>Pick House Location</Typography>
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ height: 450 }}>
            <MapSelector value={form.location} onChange={(loc) => setForm(p => ({ ...p, location: loc }))} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setMapDialogOpen(false)} variant="contained" fullWidth sx={{ py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#3B82F6' }}>Confirm Location</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddFamily;
