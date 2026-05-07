import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, Divider, Chip } from '@mui/material';
import API_BASE_URL from '../../config';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const MyFamily = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyFamily = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/family-user/my-family`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load family details');
      } finally {
        setLoading(false);
      }
    };
    fetchMyFamily();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="info">No family data found.</Alert>;

  const { family, members } = data;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 10 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            src={family.family_pic} 
            sx={{ width: 100, height: 100, borderRadius: 4, mr: 3, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            <HomeWorkIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={900} color="#1E3A8A">{family.head_name}'s Family</Typography>
            <Typography variant="subtitle1" color="textSecondary" fontWeight={600}>{family.family_id} • {family.anbiyam}</Typography>
            <Chip 
              label={family.active ? 'Active' : 'Pending Approval'} 
              color={family.active ? 'success' : 'warning'} 
              size="small" 
              sx={{ mt: 1, fontWeight: 700 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 2, color: '#4F46E5' }} />
              <Typography fontWeight={600}>{family.mobile_number}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 2, color: '#4F46E5', mt: 0.5 }} />
              <Typography variant="body2" color="textSecondary">
                {family.address_line1}<br />
                {family.address_line2 && <>{family.address_line2}<br /></>}
                {family.city}, {family.pincode}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="textSecondary" fontWeight={700}>Family Stats</Typography>
            <Typography variant="body2">Total Members: {members.length}</Typography>
            <Typography variant="body2">Resident Since: {family.resident_from}</Typography>
            <Typography variant="body2">Cemetery No: {family.cemetery_number || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={800} sx={{ mt: 5, mb: 2 }}>Family Members</Typography>
        <Grid container spacing={2}>
          {members.map((member) => (
            <Grid item xs={12} key={member.id}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <Typography fontWeight={700}>{member.name}</Typography>
                <Typography variant="caption" color="textSecondary">{member.relationship} • {member.gender} • {member.marital_status}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MyFamily;
