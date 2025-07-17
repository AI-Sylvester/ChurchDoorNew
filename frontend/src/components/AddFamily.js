import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,DialogActions,
  IconButton,
  InputAdornment,
Autocomplete ,
  Paper
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoomIcon from '@mui/icons-material/Room'; // map pin icon
import API_BASE_URL from '../config';
import MapSelector from './Mapselector';
const AddFamily = () => {
  const navigate = useNavigate();

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
    anbiyam: '',
    family_pic: '',
    cemetery_number: '',
    old_card_number: '',
    active: true,
    location: ''
  };
const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [anbiyamList, setAnbiyamList] = useState([]);
  const [family, setFamily] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
const [previewUrl, setPreviewUrl] = useState('');
const [uploadSuccess, setUploadSuccess] = useState(false);
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
    } catch (err) {
      console.error(err);
      setError('Failed to create family');
    }
  };

 const resetForm = () => {
  setForm(initialForm);
  setFamily(null);
  setFile(null);              // Clear selected file
  setPreviewUrl('');          // Clear image preview URL
  setUploadSuccess(false);    // Hide upload success message
  setError('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

  return (
  <Box>
    {/* Heading */}
    <Box
      sx={{
        backgroundColor: '#03a8f5ff',
        color: '#000',
        p: 2,
        borderRadius: 2,
        mb: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6">Register Family</Typography>
    </Box>

    {/* Form Section */}
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Container for all fields */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2, // spacing between items
        }}
      >
        {/* Each input box will take 25% width - 4 per row */}
        {/** 16 fields, each Box width 25% */}
        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Head Name*"
            name="head_name"
            value={form.head_name}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Address Line 1"
            name="address_line1"
            value={form.address_line1}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Address Line 2"
            name="address_line2"
            value={form.address_line2}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            fullWidth
          />
        </Box>
           <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
  <TextField
    label="Location"
    name="location"
    value={form.location}
    onChange={handleChange}
    fullWidth
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setMapDialogOpen(true)}>
            <RoomIcon color="primary" />
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
</Box>

   <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <FormControl fullWidth>
            <InputLabel>House Type</InputLabel>
            <Select
              name="house_type"
              value={form.house_type}
              onChange={handleChange}
              label="House Type"
            >
              <MenuItem value="Own">Own</MenuItem>
              <MenuItem value="Rental">Rental</MenuItem>
              <MenuItem value="Lease">Lease</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
         <Autocomplete
  fullWidth
  options={anbiyamList.map((item) => item.name)}
  value={form.anbiyam || null}
  onChange={(event, newValue) => {
    setForm((prev) => ({ ...prev, anbiyam: newValue || '' }));
  }}
  renderInput={(params) => (
    <TextField {...params} label="Anbiyam" />
  )}
  freeSolo
/>
        </Box>
        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Mobile Number"
            name="mobile_number"
            value={form.mobile_number}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Alternate Mobile"
            name="mobile_number2"
            value={form.mobile_number2}
            onChange={handleChange}
            fullWidth
          />
        </Box>
 
        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <FormControl fullWidth>
            <InputLabel>Cemetery</InputLabel>
            <Select
              name="cemetery"
              value={form.cemetery}
              onChange={handleChange}
              label="Cemetery"
            >
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Cemetery Number"
            name="cemetery_number"
            value={form.cemetery_number}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Native"
            name="native"
            value={form.native}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Resident From"
            name="resident_from"
            value={form.resident_from}
            onChange={handleChange}
            fullWidth
          />
        </Box>

     

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Subscription"
            name="subscription"
            value={form.subscription}
            onChange={handleChange}
            fullWidth
          />
        </Box>

        <Box sx={{ flex: '1 1 23%', minWidth: '230px' }}>
          <TextField
            label="Card Number"
            name="old_card_number"
            value={form.old_card_number}
            onChange={handleChange}
            fullWidth
          />
        </Box>

  

             </Box>

      {/* Active checkbox - full width, below all fields */}
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
          }
          label="Active"
        />
      </Box>

      {/* Upload picture full width */}
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" component="label" fullWidth>
          Upload Family Picture
         <input
  type="file"
  accept="image/*"
  hidden
  onChange={(e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadSuccess(true);
    }
  }}
/>
        </Button>
      </Box>
{uploadSuccess && (
  <Box mt={2} textAlign="center">
    <Typography color="success.main">Image uploaded successfully!</Typography>
    {previewUrl && (
      <Box mt={1}>
        <img
          src={previewUrl}
          alt="Preview"
          style={{ width: 200, borderRadius: 8 }}
        />
      </Box>
    )}
  </Box>
)}
      {/* Create button centered */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={createFamily}
          sx={{
            backgroundColor: '#c5c5be',
            color: '#000',
            fontWeight: 'bold',
            px: 6,
            '&:hover': { backgroundColor: '#f2c600' },
          }}
        >
          Create Family
        </Button>
      </Box>

      {/* Success & Error Messages */}
      {family && (
        <Box mt={3} textAlign="center">
          <Typography variant="h6" color="success.main" gutterBottom>
            Family created successfully!
          </Typography>
          <Typography>
            <strong>Family ID:</strong> {family.family_id}
          </Typography>
          {family.family_pic && (
            <Box mt={2}>
              <img
                src={`${API_BASE_URL}${family.family_pic}`}
                alt="Family"
                style={{ width: 200, borderRadius: 8 }}
              />
            </Box>
          )}
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/add-member?family_id=${family.family_id}`)}
              sx={{ mr: 1 }}
            >
              Add Member
            </Button>
            <Button variant="outlined" onClick={resetForm}>
              Add New
            </Button>
          </Box>
        </Box>
      )}

      {error && (
        <Typography color="error" mt={3} textAlign="center">
          {error}
        </Typography>
      )}
    </Paper>
   <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Select Location</DialogTitle>
  <DialogContent>
    <Box sx={{ height: 300 }}>
      <MapSelector
        value={form.location}
        onChange={(loc) => {
          setForm(prev => ({ ...prev, location: loc }));
        }}
      />
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setMapDialogOpen(false)}>Save</Button>
  </DialogActions>
</Dialog>
  </Box>
  
);


};

export default AddFamily;
