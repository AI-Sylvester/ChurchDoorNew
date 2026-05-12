import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, 
  ListItemText, Avatar, Chip, Tabs, Tab, 
  Card, CardContent, Dialog, DialogTitle, DialogContent, 
  DialogActions, IconButton, Stack
} from '@mui/material';
import API_BASE_URL from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

const AdminApprovals = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [openReview, setOpenReview] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t !== null) setTab(parseInt(t));
  }, [location]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, famRes, memRes, updateRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin-panel/pending-users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/pending-families`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/pending-members`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/admin-panel/update-requests`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(userRes.data);
      setFamilies(famRes.data);
      setPendingMembers(memRes.data);
      setUpdateRequests(updateRes.data);
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
      console.error('FETCH MEMBERS ERROR:', err.response?.data || err.message);
      alert('Failed to load family members: ' + (err.response?.data?.error || err.message));
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

  const handleUpdateAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin-panel/update-requests/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdateRequests(updateRequests.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to process update request');
    }
  };

  if (loading && !openReview) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, pb: 10, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom sx={{ letterSpacing: '-1px', mb: 3 }}>
        {tab === 0 ? 'User Account Approvals' : tab === 1 ? 'Family Approvals' : tab === 2 ? 'Member Approvals' : 'Update Request Approvals'}
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
        <Tab label={`Updates (${updateRequests.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {users.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending users</Typography>
            </Paper>
          ) : (
            users.map((user) => (
              <Card key={user.id} sx={{ borderRadius: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box display="flex" alignItems="center" mb={2.5}>
                    <Avatar sx={{ bgcolor: '#4F46E515', color: '#4F46E5', mr: 2, width: 48, height: 48 }}><PersonIcon /></Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={900} color="#1E293B">{user.username}</Typography>
                        {user.verification_status === 'recommended' && (
                          <Chip label="Vetted" size="small" color="success" variant="outlined" sx={{ fontWeight: 800, height: 18, fontSize: '0.6rem' }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role} • {user.anbiyam}</Typography>
                    </Box>
                  </Box>
                  
                  <Stack spacing={1.5} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 4, mb: 2.5, border: '1px solid #F1F5F9' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>FAMILY HEAD / ID</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155">
                        {user.family_head_name && user.family_head_name !== 'null' ? user.family_head_name : 'Pending Registration'} 
                        <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>({user.family_id || 'N/A'})</Typography>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>ADDRESS</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155">
                        {[user.address_line1, user.address_line2].filter(v => v && v !== 'null').join(', ') || 'No Address'}{user.city && user.city !== 'null' ? `, ${user.city}` : ''}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>CONTACT</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155">{user.mobile && user.mobile !== 'null' ? user.mobile : '-'}</Typography>
                    </Box>
                  </Stack>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleApproveUser(user.id)} 
                    sx={{ 
                      borderRadius: 3.5, 
                      fontWeight: 900, 
                      py: 1.5,
                      textTransform: 'none',
                      boxShadow: user.verification_status === 'recommended' ? '0 10px 25px rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                  >
                    {user.verification_status === 'recommended' ? 'Verify & Approve Account' : 'Approve Account'}
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
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#64748B', fontWeight: 700 }}>
                          ENTRY BY: {fam.creator_name || 'System'} • {fam.created_at ? new Date(fam.created_at).toLocaleDateString() : 'N/A'}
                        </Typography>
                        {fam.verified_by_name && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.3, color: '#10B981', fontWeight: 800 }}>
                            VETTED BY: {fam.verified_by_name} • {fam.verified_at ? new Date(fam.verified_at).toLocaleDateString() : 'N/A'}
                          </Typography>
                        )}
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pendingMembers.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }} elevation={0}>
              <Typography variant="h6" fontWeight={800} color="textSecondary">No pending member additions</Typography>
            </Paper>
          ) : (
            pendingMembers.map((m) => (
              <Card key={m.member_id} sx={{ 
                borderRadius: 5, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
                border: m.verification_status === 'recommended' ? '2.5px solid #10B981' : '1px solid #F1F5F9' 
              }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
                    <Box>
                      <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ mb: 0.5 }}>{m.name}</Typography>
                      <Typography variant="caption" color="primary" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {m.relationship} • {m.age} Years
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={m.verification_status === 'recommended' ? 'Vetted' : 'New Add'} 
                        size="small" 
                        color={m.verification_status === 'recommended' ? 'success' : 'warning'}
                        sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20 }} 
                      />
                    </Stack>
                  </Box>

                  <Stack spacing={1.5} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 4, mb: 3, border: '1px solid #F1F5F9' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>FAMILY CONTEXT</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155">
                        {m.family_head_name && m.family_head_name !== 'null' ? m.family_head_name : 'No Family Name'}
                        <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>({m.family_string_id})</Typography>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>REGISTERED BY & DATE</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155">{m.creator_username || 'N/A'} • {m.entry_date ? new Date(m.entry_date).toLocaleDateString() : 'N/A'}</Typography>
                    </Box>
                    {m.verified_by_name && (
                      <Box>
                        <Typography variant="caption" color="success.main" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>VETTED BY & DATE</Typography>
                        <Typography variant="body2" fontWeight={700} color="success.dark">{m.verified_by_name} • {m.verification_date ? new Date(m.verification_date).toLocaleDateString() : 'N/A'}</Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.65rem' }}>ADDRESS & ANBIYAM</Typography>
                      <Typography variant="body2" fontWeight={700} color="#334155" sx={{ fontSize: '0.8rem' }}>
                        {[m.family_address1, m.family_address2].filter(v => v && v !== 'null').join(', ')} | {m.family_anbiyam}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleApproveMember(m.member_id)} 
                    sx={{ 
                      borderRadius: 3.5, 
                      fontWeight: 900, 
                      py: 1.5,
                      textTransform: 'none',
                      boxShadow: m.verification_status === 'recommended' ? '0 10px 25px rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                  >
                    {m.verification_status === 'recommended' ? 'Final Approve Member' : 'Approve Addition'}
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
                    <Chip icon={<VerifiedIcon />} label="Vetted by Incharge" size="small" color="success" sx={{ fontWeight: 800 }} />
                  </Box>
                  <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, mb: 3, border: '1px solid #F1F5F9' }}>
                    <Typography variant="subtitle2" fontWeight={800} mb={1}>Requested Changes:</Typography>
                    {Object.entries(req.requested_data).map(([key, val]) => (
                      <Typography key={key} variant="body2" color="textSecondary">
                        <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {String(val)}
                      </Typography>
                    ))}
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleUpdateAction(req.id, 'approved')}
                      sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}
                    >
                      Approve Changes
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleUpdateAction(req.id, 'rejected')}
                      sx={{ borderRadius: 3, fontWeight: 800, py: 1.2 }}
                    >
                      Reject
                    </Button>
                  </Stack>
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
              <Stack spacing={2} sx={{ mt: 1.5, mb: 4 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block" fontWeight={700}>HEAD NAME & ID</Typography>
                  <Typography variant="body1" fontWeight={800}>{selectedFamily.head_name} ({selectedFamily.family_id})</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block" fontWeight={700}>ADDRESS</Typography>
                  <Typography variant="body1" fontWeight={700}>{selectedFamily.address_line1}, {selectedFamily.city}</Typography>
                </Box>
                {selectedFamily.verified_by_name && (
                  <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #DCFCE7' }}>
                    <Typography variant="caption" color="success.main" display="block" fontWeight={800}>VETTED BY INCHARGE</Typography>
                    <Typography variant="body2" fontWeight={800} color="success.dark">
                      {selectedFamily.verified_by_name} • {selectedFamily.verified_at ? new Date(selectedFamily.verified_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                )}
              </Stack>
              
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
              <Box sx={{ mt: 3, p: 2, bgcolor: '#EEF2FF', borderRadius: 3, border: '1px solid #E0E7FF' }}>
                <Typography variant="caption" color="#4F46E5" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon sx={{ fontSize: 16 }} /> OFFICIAL IDENTITY WILL BE GENERATED
                </Typography>
                <Typography variant="body2" color="#4338CA" fontWeight={600} sx={{ mt: 0.5 }}>
                  A unique card number will be assigned for {selectedFamily.anbiyam} starting from the next available sequence.
                </Typography>
              </Box>
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
