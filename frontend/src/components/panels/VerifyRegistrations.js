import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import API_BASE_URL from '../../config';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Grid, Card, CardContent, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Stack, 
  Avatar
} from '@mui/material';

const VerifyRegistrations = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [members, setMembers] = useState([]);
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
      setOpenReview(false);
    } catch (err) {
      alert('Failed to recommend family');
    }
  };

  const handleReview = async (family) => {
    setSelectedFamily(family);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/family/${family.family_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.members || []);
      setOpenReview(true);
    } catch (err) {
      alert('Failed to load family members');
    } finally {
      setLoading(false);
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
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
          <VerifiedUserIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
          <Typography variant="h6" fontWeight={800}>All Clear!</Typography>
          <Typography color="textSecondary">No new registrations to verify in your group.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {families.map((fam) => (
            <Grid item xs={12} key={fam.family_id}>
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: '#4F46E515', color: '#4F46E5', mr: 2, width: 50, height: 50 }}>
                      <HomeWorkIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>{fam.head_name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        ID: {fam.family_id} • {fam.mobile_number}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      variant="outlined" 
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleReview(fam)}
                      sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                    >
                      Review Details
                    </Button>
                    <Button 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleRecommend(fam.family_id)}
                      sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                    >
                      Quick Verify
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detailed Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>Registration Review</Typography>
          <IconButton onClick={() => setOpenReview(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedFamily && (
            <Box>
              <Typography variant="subtitle2" color="primary" fontWeight={800} gutterBottom>FAMILY INFORMATION</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Head Name</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFamily.head_name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Address</Typography>
                  <Typography variant="body1">{selectedFamily.address_line1}, {selectedFamily.city} - {selectedFamily.pincode}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Mobile</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFamily.mobile_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Anbiyam</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFamily.anbiyam}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" color="primary" fontWeight={800} gutterBottom>FAMILY MEMBERS ({members.length})</Typography>
              <List sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 0 }}>
                {members.map((m, idx) => (
                  <ListItem key={idx} divider={idx < members.length - 1}>
                    <ListItemText 
                      primary={<Typography variant="body1" fontWeight={700}>{m.name}</Typography>}
                      secondary={m.relationship}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenReview(false)} variant="text" sx={{ fontWeight: 700 }}>Close</Button>
          <Button 
            variant="contained" 
            color="success" 
            fullWidth
            onClick={() => handleRecommend(selectedFamily.family_id)}
            sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}
          >
            Verify & Recommend for Approval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifyRegistrations;
