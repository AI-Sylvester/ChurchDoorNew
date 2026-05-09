import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText } from '@mui/material';
import API_BASE_URL from '../../config';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Grid, Card, CardContent, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton, Stack, 
  Avatar, Tabs, Tab
} from '@mui/material';

const VerifyRegistrations = () => {
  const [families, setFamilies] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const location = useLocation();

  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t !== null) setTab(parseInt(t));
  }, [location]);
  const anbiyam = localStorage.getItem('anbiyam');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [famRes, memRes, userRes, updateRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/incharge/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/incharge/pending-member-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/incharge/pending-user-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/incharge/update-requests`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFamilies(famRes.data);
      setPendingMembers(memRes.data);
      setPendingUsers(userRes.data);
      setUpdateRequests(updateRes.data);
    } catch (err) {
      setError('Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleRecommendMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/recommend-member-approval/${memberId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingMembers(pendingMembers.filter(m => m.member_id !== memberId));
    } catch (err) {
      alert('Failed to recommend member');
    }
  };
  
  const handleRecommendUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/recommend-user-approval/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to verify user');
    }
  };

  const handleVerifyUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/verify-update/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdateRequests(updateRequests.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to verify update request');
    }
  };

  const handleReview = async (family) => {
    setSelectedFamily(family);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/member/byFamily/${family.family_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data || []);
      setOpenReview(true);
    } catch (err) {
      alert('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !openReview) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, pb: 10, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom sx={{ letterSpacing: '-1px' }}>
        Verify Registrations
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4} fontWeight={600}>
        New registrations in <strong>{anbiyam}</strong> awaiting your verification.
      </Typography>

      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        variant="fullWidth"
        sx={{ 
          mb: 4, 
          bgcolor: '#fff', 
          borderRadius: 4, 
          p: 0.5,
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          '& .MuiTabs-indicator': { height: '100%', borderRadius: 3, bgcolor: '#4F46E510', zIndex: 0 },
          '& .MuiTab-root': { zIndex: 1, fontWeight: 800, textTransform: 'none' }
        }}
      >
        <Tab label={`Families (${families.length})`} />
        <Tab label={`Members (${pendingMembers.length})`} />
        <Tab label={`Users (${pendingUsers.length})`} />
        <Tab label={`Updates (${updateRequests.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {families.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <VerifiedUserIcon sx={{ fontSize: 60, color: '#10B981', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="textSecondary">No new families to verify</Typography>
            </Paper>
          ) : (
            families.map((fam) => (
              <Card key={fam.family_id} sx={{ borderRadius: 4, boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#4F46E515', color: '#4F46E5', mr: 2, width: 50, height: 50 }}>
                        <HomeWorkIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={900}>{fam.head_name}</Typography>
                        <Typography variant="body2" color="textSecondary" fontWeight={600}>
                          ID: {fam.family_id} • {fam.mobile_number}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1.5} width={{ xs: '100%', sm: 'auto' }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleReview(fam)}
                        sx={{ flex: 1, borderRadius: 3, fontWeight: 800, textTransform: 'none', px: 3 }}
                      >
                        Review
                      </Button>
                      <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleRecommend(fam.family_id)}
                        sx={{ flex: 1, borderRadius: 3, fontWeight: 800, textTransform: 'none', px: 3 }}
                      >
                        Verify
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {pendingMembers.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0', gridColumn: '1/-1' }} elevation={0}>
              <VerifiedUserIcon sx={{ fontSize: 60, color: '#3B82F6', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="textSecondary">No individual members to verify</Typography>
            </Paper>
          ) : (
            pendingMembers.map((m) => (
              <Card key={m.member_id} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight={900}>{m.name}</Typography>
                    <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      {m.relationship} • Family: {m.family_head}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ bgcolor: '#F8FAFC', p: 1, borderRadius: 2, border: '1px solid #F1F5F9' }}>
                      {m.address_line1}{m.address_line2 ? `, ${m.address_line2}` : ''}, {m.city}
                    </Typography>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleRecommendMember(m.member_id)} 
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}
                  >
                    Verify Member
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
      
      {tab === 2 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {pendingUsers.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0', gridColumn: '1/-1' }} elevation={0}>
              <VerifiedUserIcon sx={{ fontSize: 60, color: '#8B5CF6', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="textSecondary">No new user accounts to verify</Typography>
            </Paper>
          ) : (
            pendingUsers.map((u) => (
              <Card key={u.id} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight={900}>{u.username}</Typography>
                    <Typography variant="caption" color="secondary" fontWeight={800} sx={{ textTransform: 'uppercase', display: 'block' }}>
                      {u.role} • Family: {u.family_head} ({u.family_id})
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 1, bgcolor: '#F8FAFC', p: 1, borderRadius: 2, border: '1px solid #F1F5F9', fontSize: '0.8rem' }}>
                      Address: {u.address_line1}{u.address_line2 ? `, ${u.address_line2}` : ''}, {u.city}<br/>
                      Mobile: {u.mobile}
                    </Typography>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleRecommendUser(u.id)} 
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, bgcolor: '#8B5CF6', '&:hover': { bgcolor: '#7C3AED' } }}
                  >
                    Verify User Account
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 3 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {updateRequests.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending update requests</Typography>
            </Paper>
          ) : (
            updateRequests.map((req) => (
              <Card key={req.id} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>{req.head_name} ({req.family_id})</Typography>
                      <Typography variant="caption" color="textSecondary" fontWeight={700}>
                        SUBMITTED ON: {new Date(req.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, mb: 3, border: '1px solid #F1F5F9' }}>
                    <Typography variant="subtitle2" fontWeight={800} mb={1}>Changes to Verify:</Typography>
                    {Object.entries(req.requested_data).map(([key, val]) => (
                      <Typography key={key} variant="body2" color="textSecondary">
                        <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {String(val)}
                      </Typography>
                    ))}
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleVerifyUpdate(req.id)}
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}
                  >
                    Verify & Forward to Admin
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Detailed Review Dialog */}
      <Dialog 
        open={openReview} 
        onClose={() => setOpenReview(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
      >
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={900}>Vetting Review</Typography>
          <IconButton onClick={() => setOpenReview(false)} sx={{ bgcolor: '#F1F5F9' }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
          {selectedFamily && (
            <Box>
              <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: 1 }}>FAMILY DATA</Typography>
              <Grid container spacing={2} sx={{ mt: 1, mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary" display="block">Head Name</Typography>
                  <Typography variant="body1" fontWeight={800}>{selectedFamily.head_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary" display="block">Address</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFamily.address_line1}, {selectedFamily.city}</Typography>
                </Grid>
              </Grid>
              
              <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: 1 }}>MEMBERS ({members.length})</Typography>
              <List sx={{ mt: 1, bgcolor: '#F8FAFC', borderRadius: 4, overflow: 'hidden' }}>
                {members.map((m, idx) => (
                  <ListItem key={idx} divider={idx < members.length - 1} sx={{ py: 1.5 }}>
                    <ListItemText 
                      primary={<Typography variant="body2" fontWeight={800}>{m.name}</Typography>} 
                      secondary={<Typography variant="caption" fontWeight={600} color="textSecondary">{m.relationship} • {m.age} years</Typography>} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button onClick={() => setOpenReview(false)} sx={{ fontWeight: 800, color: '#64748B' }}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            fullWidth
            onClick={() => handleRecommend(selectedFamily.family_id)}
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
          >
            Verify & Recommend
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifyRegistrations;
