import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, Divider, Chip, Tabs, Tab, 
  Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack
} from '@mui/material';
import API_BASE_URL from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [members, setMembers] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, famRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin-panel/pending-users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/pending-families`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(userRes.data);
      setFamilies(famRes.data);
    } catch (err) {
      setError('Failed to load pending data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/user/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to approve user');
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

  const handleApproveFamily = async (familyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/family/${familyId}`, { active: true, verification_status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilies(families.filter(f => f.family_id !== familyId));
      setOpenReview(false);
    } catch (err) {
      alert('Failed to approve family');
    }
  };

  if (loading && !openReview) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom sx={{ letterSpacing: '-1px' }}>Approvals Center</Typography>
      
      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        sx={{ 
          mb: 3, 
          bgcolor: '#fff', 
          borderRadius: 3, 
          p: 0.5,
          '& .MuiTabs-indicator': { borderRadius: '10px' }
        }}
      >
        <Tab label={`New Users (${users.length})`} sx={{ fontWeight: 800 }} />
        <Tab label={`Family Registrations (${families.length})`} sx={{ fontWeight: 800 }} />
      </Tabs>

      {tab === 0 ? (
        <Box>
          {users.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800}>No pending users</Typography>
            </Paper>
          ) : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              {users.map((user, idx) => (
                <React.Fragment key={user.id}>
                  <ListItem sx={{ p: 3 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#4F46E515', color: '#4F46E5' }}><PersonIcon /></Avatar></ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="h6" fontWeight={800}>{user.username}</Typography>}
                      secondary={<Typography variant="body2" color="textSecondary">{user.mobile} • {user.role} • {user.anbiyam}</Typography>}
                    />
                    <Button variant="contained" color="success" onClick={() => handleApproveUser(user.id)} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>Approve User</Button>
                  </ListItem>
                  {idx < users.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      ) : (
        <Box>
          {families.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800}>No pending families</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {families.map((fam) => (
                <Grid item xs={12} key={fam.family_id}>
                  <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: fam.verification_status === 'recommended' ? '2px solid #10B981' : '1px solid #F1F5F9' }}>
                    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#05966915', color: '#059669', mr: 2, width: 50, height: 50 }}>
                          <HomeWorkIcon />
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="h6" fontWeight={800}>{fam.head_name}</Typography>
                            {fam.verification_status === 'recommended' && (
                              <Chip icon={<VerifiedIcon />} label="Vetted by Incharge" size="small" color="success" sx={{ fontWeight: 800 }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="textSecondary">
                            {fam.family_id} • {fam.anbiyam} • {fam.mobile_number}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => handleReview(fam)} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>Review</Button>
                        <Button variant="contained" color="success" onClick={() => handleApproveFamily(fam.family_id)} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>Approve & Active</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Family Review Dialog */}
      <Dialog open={openReview} onClose={() => setOpenReview(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>Final Registration Review</Typography>
          <IconButton onClick={() => setOpenReview(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedFamily && (
            <Box>
              <Typography variant="subtitle2" color="primary" fontWeight={800} gutterBottom>FAMILY DETAILS</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}><Typography variant="body2" color="textSecondary">Head Name</Typography><Typography variant="body1" fontWeight={700}>{selectedFamily.head_name}</Typography></Grid>
                <Grid item xs={12}><Typography variant="body2" color="textSecondary">Address</Typography><Typography variant="body1">{selectedFamily.address_line1}, {selectedFamily.city}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="textSecondary">Mobile</Typography><Typography variant="body1" fontWeight={700}>{selectedFamily.mobile_number}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" color="textSecondary">Anbiyam</Typography><Typography variant="body1" fontWeight={700}>{selectedFamily.anbiyam}</Typography></Grid>
              </Grid>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="subtitle2" color="primary" fontWeight={800} gutterBottom>MEMBERS ({members.length})</Typography>
              <List sx={{ bgcolor: '#F8FAFC', borderRadius: 3 }}>
                {members.map((m, idx) => (
                  <ListItem key={idx} divider={idx < members.length - 1}>
                    <ListItemText primary={<Typography variant="body1" fontWeight={700}>{m.name}</Typography>} secondary={m.relationship} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenReview(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button variant="contained" color="success" fullWidth onClick={() => handleApproveFamily(selectedFamily.family_id)} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700 }}>Approve & Activate Family</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApprovals;
