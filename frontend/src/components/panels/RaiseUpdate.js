import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, TextField, Button, Alert, Grid } from '@mui/material';
import API_BASE_URL from '../../config';
import EditNoteIcon from '@mui/icons-material/EditNote';

const RaiseUpdate = () => {
  const [headName, setHeadName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const requested_data = {};
      if (headName) requested_data.head_name = headName;
      if (mobile) requested_data.mobile_number = mobile;
      if (address) requested_data.address_line1 = address;

      await axios.post(`${API_BASE_URL}/family-user/update-request`, {
        requested_data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Update request raised successfully! Admin will review it.');
      setHeadName('');
      setMobile('');
      setAddress('');
      setReason('');
    } catch (err) {
      setError('Failed to raise update request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, pb: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EditNoteIcon sx={{ fontSize: 60, color: '#F59E0B', mb: 1 }} />
          <Typography variant="h5" fontWeight={900}>Raise Update Request</Typography>
          <Typography variant="body2" color="textSecondary">Details cannot be edited directly. Please submit a request.</Typography>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" mb={1}>Enter only fields that need updating:</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="New Head Name" value={headName} onChange={(e) => setHeadName(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="New Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="New Address" multiline rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Reason for Change" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                required 
                helperText="Required for admin review"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 2, 
                  borderRadius: 3, 
                  fontWeight: 800, 
                  bgcolor: '#F59E0B',
                  '&:hover': { bgcolor: '#D97706' }
                }}
              >
                {loading ? 'Submitting...' : 'Submit Update Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default RaiseUpdate;
