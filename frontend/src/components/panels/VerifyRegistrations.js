import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import API_BASE_URL from '../../config';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const VerifyRegistrations = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const anbiyam = localStorage.getItem('anbiyam');

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/incharge/pending-verifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilies(res.data);
    } catch (err) {
      setError('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleRecommend = async (familyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/recommend-approval/${familyId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilies(families.filter(f => f.family_id !== familyId));
      alert('Family verified and recommended to Admin!');
    } catch (err) {
      alert('Failed to recommend family');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Verify Registrations</Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        New family registrations in <strong>{anbiyam}</strong> group.
      </Typography>

      {families.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <VerifiedUserIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
          <Typography variant="h6">All Clear!</Typography>
          <Typography color="textSecondary">No new registrations to verify in your group.</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {families.map((fam, idx) => (
            <React.Fragment key={fam.family_id}>
              <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}>
                  <HomeWorkIcon color="primary" />
                </Box>
                <ListItemText
                  primary={<Typography variant="h6" fontWeight={700}>{fam.head_name}</Typography>}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textPrimary">{fam.family_id} • {fam.mobile_number}</Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        {fam.address_line1}, {fam.city}
                      </Typography>
                      <Chip label="Pending Verification" size="small" color="warning" sx={{ mt: 1, fontWeight: 700 }} />
                    </Box>
                  }
                />
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleRecommend(fam.family_id)}
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', ml: 2 }}
                >
                  Verify & Recommend
                </Button>
              </ListItem>
              {idx < families.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default VerifyRegistrations;
