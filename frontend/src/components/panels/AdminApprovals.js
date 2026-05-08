import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, 
  ListItemText, Avatar, Chip, Tabs, Tab, 
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
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [members, setMembers] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, famRes, memRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin-panel/pending-users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/pending-families`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/pending-members`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(userRes.data);
      setFamilies(famRes.data);
      setPendingMembers(memRes.data);
      console.log('DEBUG - Raw Pending Members:', JSON.stringify(memRes.data, null, 2));
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

  const handleApproveMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/member/${memberId}`, { verification_status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingMembers(pendingMembers.filter(m => m.member_id !== memberId));
    } catch (err) {
      alert('Failed to approve member');
    }
  };

  if (loading && !openReview) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, pb: 10, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom sx={{ letterSpacing: '-1px', mb: 3 }}>
        Approvals Center
      </Typography>
      
      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 4, 
          bgcolor: '#fff', 
          borderRadius: 4, 
          p: 0.5,
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          '& .MuiTabs-indicator': { height: '100%', borderRadius: 3, bgcolor: '#4F46E510', zIndex: 0 },
          '& .MuiTab-root': { zIndex: 1, fontWeight: 800, minHeight: 48, textTransform: 'none', fontSize: '0.9rem' }
        }}
      >
        <Tab label={`Users (${users.length})`} />
        <Tab label={`Families (${families.length})`} />
        <Tab label={`Members (${pendingMembers.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {users.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0', gridColumn: '1/-1' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending users</Typography>
            </Paper>
          ) : (
            users.map((user) => (
              <Card key={user.id} sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: '#4F46E515', color: '#4F46E5', mr: 2 }}><PersonIcon /></Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={900}>{user.username}</Typography>
                        {user.verification_status === 'recommended' && (
                          <Chip label="Vetted" size="small" color="success" variant="outlined" sx={{ fontWeight: 800, height: 18, fontSize: '0.6rem' }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="textSecondary" fontWeight={700}>{user.role.toUpperCase()} • {user.anbiyam}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 3, mb: 2, border: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" color="textSecondary">
                      Family: <strong>{user.family_head}</strong> ({user.family_id})<br/>
                      Address: <strong>{user.address_line1}{user.address_line2 ? `, ${user.address_line2}` : ''}, {user.city}</strong><br/>
                      Mobile: <strong>{user.mobile}</strong><br/>
                      Email: <strong>{user.email || '-'}</strong>
                    </Typography>
                  </Box>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleApproveUser(user.id)} 
                      sx={{ 
                        borderRadius: 3, 
                        fontWeight: 900, 
                        py: 1.2,
                        boxShadow: user.verification_status === 'recommended' ? '0 8px 20px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                    >
                      {user.verification_status === 'recommended' ? 'Final Approve' : 'Approve User'}
                    </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'grid', gap: 2 }}>
          {families.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending families</Typography>
            </Paper>
          ) : (
            families.map((fam) => (
              <Card key={fam.family_id} sx={{ 
                borderRadius: 4, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                border: fam.verification_status === 'recommended' ? '2px solid #10B981' : '1px solid #F1F5F9',
                overflow: 'visible',
                position: 'relative'
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: '#05966915', color: '#059669', mr: 2, width: 50, height: 50 }}>
                        <HomeWorkIcon />
                      </Avatar>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="h6" fontWeight={900}>{fam.head_name}</Typography>
                          {fam.verification_status === 'recommended' && (
                            <Chip icon={<VerifiedIcon />} label="Vetted" size="small" color="success" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Stack>
                        <Typography variant="body2" color="textSecondary" fontWeight={600}>
                          {fam.family_id} • {fam.anbiyam}
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1.5} width={{ xs: '100%', sm: 'auto' }}>
                      <Button 
                        fullWidth={false}
                        variant="outlined" 
                        startIcon={<VisibilityIcon />} 
                        onClick={() => handleReview(fam)} 
                        sx={{ flex: 1, borderRadius: 3, fontWeight: 800, textTransform: 'none', px: 3 }}
                      >
                        Review
                      </Button>
                      <Button 
                        fullWidth={false}
                        variant="contained" 
                        color="success" 
                        onClick={() => handleApproveFamily(fam.family_id)} 
                        sx={{ flex: 1, borderRadius: 3, fontWeight: 800, textTransform: 'none', px: 3 }}
                      >
                        Approve
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {pendingMembers.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0', gridColumn: '1/-1' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending member additions</Typography>
            </Paper>
          ) : (
            pendingMembers.map((m) => (
              <Card key={m.member_id} sx={{ 
                borderRadius: 4, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                border: m.verification_status === 'recommended' ? '2px solid #3B82F6' : '1px solid #F1F5F9' 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={900} color="#1E293B">{m.name}</Typography>
                      <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>
                        {m.relationship}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={m.verification_status === 'recommended' ? 'Vetted' : 'New Registration'} 
                        size="small" 
                        color={m.verification_status === 'recommended' ? 'success' : 'warning'}
                        variant={m.verification_status === 'recommended' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} 
                      />
                      {m.verification_status === 'recommended' && <VerifiedIcon sx={{ fontSize: 16, color: '#10B981' }} />}
                    </Stack>
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 3, mb: 2, border: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" color="textSecondary">
                      {(() => {
                        console.log('Member raw data:', m);
                        return null;
                      })()}
                      Family: <strong>{m.family_head_name}</strong> ({m.family_string_id})<br/>
                      Address: <strong>{m.family_address1}{m.family_address2 ? `, ${m.family_address2}` : ''}, {m.family_city}</strong><br/>
                      Anbiyam: <strong>{m.family_anbiyam}</strong>
                    </Typography>
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleApproveMember(m.member_id)} 
                    sx={{ 
                      borderRadius: 3, 
                      fontWeight: 800, 
                      py: 1.2,
                      boxShadow: m.verification_status === 'recommended' ? '0 8px 20px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                  >
                    {m.verification_status === 'recommended' ? 'Final Approve' : 'Approve Member'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Family Review Dialog */}
      <Dialog 
        open={openReview} 
        onClose={() => setOpenReview(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 5, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
      >
        <DialogTitle sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={900}>Final Registration Review</Typography>
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
                  <Typography variant="caption" color="textSecondary" display="block">Family ID</Typography>
                  <Typography variant="body1" fontWeight={800}>{selectedFamily.family_id}</Typography>
                </Grid>
                <Grid item xs={12}>
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
            onClick={() => handleApproveFamily(selectedFamily.family_id)} 
            sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
          >
            Approve & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApprovals;
