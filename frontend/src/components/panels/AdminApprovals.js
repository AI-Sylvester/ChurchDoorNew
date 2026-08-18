import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem,
  ListItemText, Avatar, Chip, Tabs, Tab,
  Card, CardContent, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Stack, Divider, useTheme, useMediaQuery
} from '@mui/material';
import API_BASE_URL from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const FAMILY_LABELS = {
  head_name: 'Head Name', address_line1: 'Address Line 1', address_line2: 'Address Line 2',
  city: 'City', pincode: 'Pincode', mobile_number: 'Mobile Number', mobile_number2: 'Alternate Mobile',
  cemetery: 'Cemetery Registered', cemetery_number: 'Cemetery Number', old_card_number: 'Old Card Number',
  native: 'Native Place', resident_from: 'Resident From (Year)', house_type: 'House Type',
  subscription: 'Subscription Details', anbiyam: 'Anbiyam Group', location: 'Geo Location Pin'
};

const MEMBER_LABELS = {
  name: 'Full Name', sex: 'Sex', dob: 'Date of Birth', relationship: 'Relationship',
  marital_status: 'Marital Status', mobile: 'Mobile Number', qualification: 'Qualification',
  profession: 'Profession', church_group: 'Church Group', residing_here: 'Residing Here',
  active: 'Active Record', baptism_date: 'Baptism Date', baptism_place: 'Baptism Place',
  holy_communion_date: 'Holy Communion Date', holy_communion_place: 'Holy Communion Place',
  confirmation_date: 'Confirmation Date', confirmation_place: 'Confirmation Place',
  marriage_date: 'Marriage Date', marriage_place: 'Marriage Place'
};

const EmptyState = ({ text }) => (
  <Paper
    elevation={0}
    sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent', border: '2px dashed #E2E8F0' }}
  >
    <Typography variant="subtitle1" fontWeight={700} color="textSecondary">{text}</Typography>
  </Paper>
);

const AdminApprovals = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        axios.get(`${API_BASE_URL}/admin-panel/update-requests`, { headers: { Authorization: `Bearer ${token}` } }),
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

  useEffect(() => { fetchData(); }, []);

  const handleApproveUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/user/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { alert('Failed to approve user'); }
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
    } catch (err) { alert('Failed to approve family'); }
  };

  const handleApproveMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/member/${memberId}`, { verification_status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingMembers(pendingMembers.filter(m => m.member_id !== memberId));
    } catch (err) { alert('Failed to approve member'); }
  };

  const handleUpdateAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin-panel/update-requests/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdateRequests(updateRequests.filter(r => r.id !== id));
    } catch (err) { alert('Failed to process update request'); }
  };

  if (loading && !openReview) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress size={40} sx={{ color: '#1E3A8A' }} />
    </Box>
  );
  if (error) return <Alert severity="error" sx={{ m: 2, borderRadius: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ pb: 12, pt: 2.5, px: { xs: 2, sm: 2.5 } }}>
      {/* Page Title */}
      <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ mb: 2.5, letterSpacing: '-0.3px' }}>
        {tab === 0 ? 'User Approvals' : tab === 1 ? 'Family Approvals' : tab === 2 ? 'Member Approvals' : 'Update Requests'}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          mb: 3,
          bgcolor: '#fff',
          borderRadius: 3,
          p: 0.5,
          border: '1px solid #F1F5F9',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          minHeight: 44,
          '& .MuiTabs-indicator': { height: '100%', borderRadius: 2.5, bgcolor: '#EEF2FF', zIndex: 0 },
          '& .MuiTab-root': { zIndex: 1, fontWeight: 700, minHeight: 40, fontSize: '0.8rem', px: 1.5 },
          '& .Mui-selected': { color: '#1E3A8A', fontWeight: 800 },
        }}
      >
        <Tab label={`Users ${users.length > 0 ? `(${users.length})` : ''}`} />
        <Tab label={`Families ${families.length > 0 ? `(${families.length})` : ''}`} />
        <Tab label={`Members ${pendingMembers.length > 0 ? `(${pendingMembers.length})` : ''}`} />
        <Tab label={`Updates ${updateRequests.length > 0 ? `(${updateRequests.length})` : ''}`} />
      </Tabs>

      {/* ─── Tab 0: Users ─── */}
      {tab === 0 && (
        <Stack spacing={2}>
          {users.length === 0 ? (
            <EmptyState text="No pending user approvals" />
          ) : (
            users.map((user) => (
              <Card key={user.id} sx={{ borderRadius: 4, border: '1px solid #F1F5F9' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', width: 48, height: 48, borderRadius: 3 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight={800} color="#1E293B">{user.username}</Typography>
                        {user.verification_status === 'recommended' && (
                          <Chip label="Vetted" size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 800 }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {user.role} • {user.anbiyam}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 2, mb: 2, border: '1px solid #F1F5F9' }}>
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.3 }}>Family</Typography>
                        <Typography variant="body2" fontWeight={700} color="#334155">
                          {user.family_head_name && user.family_head_name !== 'null' ? user.family_head_name : 'Pending Registration'}
                          {user.family_id && <Typography component="span" variant="caption" sx={{ ml: 1, color: '#94A3B8' }}>({user.family_id})</Typography>}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.3 }}>Contact</Typography>
                        <Typography variant="body2" fontWeight={700} color="#334155">
                          {user.mobile && user.mobile !== 'null' ? user.mobile : '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveUser(user.id)}
                    startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, textTransform: 'none' }}
                  >
                    {user.verification_status === 'recommended' ? 'Verify & Approve Account' : 'Approve Account'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* ─── Tab 1: Families ─── */}
      {tab === 1 && (
        <Stack spacing={2}>
          {families.length === 0 ? (
            <EmptyState text="No pending family approvals" />
          ) : (
            families.map((fam) => (
              <Card
                key={fam.family_id}
                sx={{
                  borderRadius: 4,
                  border: fam.verification_status === 'recommended'
                    ? '2px solid #10B981'
                    : '1px solid #F1F5F9',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                    <Avatar sx={{ bgcolor: '#ECFDF5', color: '#059669', width: 48, height: 48, borderRadius: 3 }}>
                      <HomeWorkIcon />
                    </Avatar>
                    <Box flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2" fontWeight={800} color="#1E293B">{fam.head_name}</Typography>
                        {fam.verification_status === 'recommended' && (
                          <Chip icon={<VerifiedIcon sx={{ fontSize: '12px !important' }} />} label="Vetted" size="small" color="success" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 800 }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="textSecondary" fontWeight={700}>
                        {fam.family_id} • {fam.anbiyam}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', mb: 0.3 }}>
                      Entry: {fam.creator_name || 'System'} • {fam.created_at ? new Date(fam.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                    {fam.verified_by_name && (
                      <Typography variant="caption" color="#10B981" fontWeight={800} display="block" sx={{ fontSize: '0.6rem' }}>
                        Vetted by: {fam.verified_by_name}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      startIcon={<VisibilityRoundedIcon sx={{ fontSize: 15 }} />}
                      onClick={() => handleReview(fam)}
                      sx={{ flex: 1, borderRadius: 3, fontWeight: 700, textTransform: 'none', borderColor: '#E2E8F0', color: '#475569' }}
                    >
                      Review
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApproveFamily(fam.family_id)}
                      startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 15 }} />}
                      sx={{ flex: 1, borderRadius: 3, fontWeight: 800, textTransform: 'none' }}
                    >
                      Approve
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* ─── Tab 2: Members ─── */}
      {tab === 2 && (
        <Stack spacing={2}>
          {pendingMembers.length === 0 ? (
            <EmptyState text="No pending member approvals" />
          ) : (
            pendingMembers.map((m) => (
              <Card
                key={m.member_id}
                sx={{
                  borderRadius: 4,
                  border: m.verification_status === 'recommended' ? '2px solid #10B981' : '1px solid #F1F5F9',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900} color="#1E293B">{m.name}</Typography>
                      <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {m.relationship} • {m.age} Years
                      </Typography>
                    </Box>
                    <Chip
                      label={m.verification_status === 'recommended' ? 'Vetted' : 'New'}
                      size="small"
                      color={m.verification_status === 'recommended' ? 'success' : 'warning'}
                      sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20 }}
                    />
                  </Box>

                  <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, p: 2, mb: 2.5, border: '1px solid #F1F5F9' }}>
                    <Stack spacing={1.2}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Family</Typography>
                        <Typography variant="body2" fontWeight={700} color="#334155">
                          {m.family_head_name && m.family_head_name !== 'null' ? m.family_head_name : '—'}
                          {m.family_string_id && <Typography component="span" variant="caption" sx={{ ml: 1, color: '#94A3B8' }}>({m.family_string_id})</Typography>}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Registered by</Typography>
                        <Typography variant="body2" fontWeight={700} color="#334155">
                          {m.creator_username || 'N/A'} • {m.entry_date ? new Date(m.entry_date).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                      {m.verified_by_name && (
                        <Box>
                          <Typography variant="caption" color="#10B981" fontWeight={800} display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Vetted by</Typography>
                          <Typography variant="body2" fontWeight={700} color="success.dark">{m.verified_by_name}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveMember(m.member_id)}
                    startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, textTransform: 'none' }}
                  >
                    {m.verification_status === 'recommended' ? 'Final Approve' : 'Approve Member'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      {/* ─── Tab 3: Update Requests ─── */}
      {tab === 3 && (
        <Stack spacing={2}>
          {updateRequests.length === 0 ? (
            <EmptyState text="No pending update requests" />
          ) : (
            updateRequests.map((req) => {
              let data = req.requested_data;
              if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) {}
              }
              const isMember = data && data.edit_type === 'member';
              const fieldLabel = data?.field_name
                ? (isMember ? MEMBER_LABELS[data.field_name] : FAMILY_LABELS[data.field_name]) || data.field_name
                : '';
              const formatVal = (val) => {
                if (val === 'true' || val === true) return 'Yes';
                if (val === 'false' || val === false) return 'No';
                if (val === null || val === undefined || val === '') return '—';
                return String(val);
              };

              return (
                <Card key={req.id} sx={{ borderRadius: 4, border: '1px solid #F1F5F9' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={900} color="#1E293B">
                          {req.head_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight={700}>
                          {req.family_id} • {new Date(req.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '12px !important' }} />}
                        label="Vetted"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.6rem' }}
                      />
                    </Box>

                    {data?.edit_type ? (
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" color="textSecondary" display="block" fontWeight={800} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.5 }}>
                          Target: {isMember ? `Member — ${data.member_name}` : 'Family Registration'}
                        </Typography>
                        {data.field_name && (
                          <>
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 700, mb: 1 }}>
                              Field: <span style={{ color: '#475569', fontWeight: 800 }}>{fieldLabel}</span>
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: '#F8FAFC',
                                p: 1.5,
                                borderRadius: 3,
                                border: '1px solid #E2E8F0',
                              }}
                            >
                              <Box flex={1}>
                                <Typography variant="caption" color="textSecondary" display="block" fontWeight={700} sx={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Was</Typography>
                                <Typography variant="body2" sx={{ color: '#DC2626', textDecoration: 'line-through', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {formatVal(data.old_value)}
                                </Typography>
                              </Box>
                              <Typography color="#94A3B8" fontWeight={900}>→</Typography>
                              <Box flex={1}>
                                <Typography variant="caption" color="textSecondary" display="block" fontWeight={700} sx={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>Now</Typography>
                                <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 800, fontSize: '0.85rem' }}>
                                  {formatVal(data.new_value)}
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        )}
                        {data.additional_changes && (
                          <Box sx={{ mt: 1.5, bgcolor: '#FFFBEB', p: 1.5, borderRadius: 2.5, borderLeft: '3px solid #F59E0B' }}>
                            <Typography variant="caption" color="#92400E" fontWeight={700} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                              Notes
                            </Typography>
                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#78350F' }}>
                              {data.additional_changes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, mb: 2.5, border: '1px solid #E2E8F0' }}>
                        <Typography variant="subtitle2" fontWeight={800} mb={1}>Changes:</Typography>
                        {Object.entries(data || {}).map(([key, val]) => (
                          <Typography key={key} variant="body2" color="textSecondary">
                            <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {String(val)}
                          </Typography>
                        ))}
                      </Box>
                    )}

                    <Stack direction="row" spacing={1.5}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => handleUpdateAction(req.id, 'rejected')}
                        sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, textTransform: 'none' }}
                      >
                        Reject
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateAction(req.id, 'approved')}
                        sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, textTransform: 'none' }}
                      >
                        Approve
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      )}

      {/* Family Review Dialog */}
      <Dialog
        open={openReview}
        onClose={() => setOpenReview(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 5 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2.5,
            fontWeight: 900,
            fontSize: '1rem',
          }}
        >
          Family Review
          <IconButton
            onClick={() => setOpenReview(false)}
            size="small"
            sx={{ bgcolor: '#F1F5F9', color: '#64748B' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5, borderColor: '#F1F5F9' }}>
          {selectedFamily && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: '1px', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                  Family Data
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" fontWeight={700} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Head Name & ID</Typography>
                    <Typography variant="body1" fontWeight={800}>{selectedFamily.head_name} ({selectedFamily.family_id})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" fontWeight={700} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Address</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedFamily.address_line1}, {selectedFamily.city}</Typography>
                  </Box>
                  {selectedFamily.verified_by_name && (
                    <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: 3, border: '1px solid #DCFCE7' }}>
                      <Typography variant="caption" color="success.main" display="block" fontWeight={800} sx={{ fontSize: '0.6rem', textTransform: 'uppercase', mb: 0.2 }}>Vetted by Incharge</Typography>
                      <Typography variant="body2" fontWeight={800} color="success.dark">
                        {selectedFamily.verified_by_name} • {selectedFamily.verified_at ? new Date(selectedFamily.verified_at).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="caption" color="primary" fontWeight={900} sx={{ letterSpacing: '1px', fontSize: '0.65rem', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                Members ({members.length})
              </Typography>
              <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 3, overflow: 'hidden', border: '1px solid #F1F5F9' }}>
                <List disablePadding>
                  {members.map((m, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem sx={{ py: 1.5, px: 2 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: m.sex === 'Male' ? '#EFF6FF' : '#FFF1F2',
                            color: m.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            mr: 1.5,
                          }}
                        >
                          {(m.name || '?').charAt(0)}
                        </Avatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={800}>{m.name}</Typography>}
                          secondary={<Typography variant="caption" fontWeight={600} color="textSecondary">{m.relationship} • {m.age} years</Typography>}
                        />
                      </ListItem>
                      {idx < members.length - 1 && <Divider sx={{ ml: 8 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: '#EEF2FF', borderRadius: 3, border: '1px solid #E0E7FF' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <VerifiedIcon sx={{ color: '#4F46E5', fontSize: 16 }} />
                  <Typography variant="caption" color="#4F46E5" fontWeight={800} sx={{ fontSize: '0.7rem' }}>
                    A unique card number will be assigned upon approval
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setOpenReview(false)}
            sx={{ fontWeight: 700, color: '#64748B', borderRadius: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => handleApproveFamily(selectedFamily.family_id)}
            startIcon={<CheckCircleRoundedIcon />}
            sx={{ borderRadius: 3, py: 1.3, fontWeight: 900 }}
          >
            Approve & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApprovals;
