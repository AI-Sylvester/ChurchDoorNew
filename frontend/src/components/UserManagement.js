import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Card,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab,
  Paper,
  Fade,
  Collapse,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PersonIcon from '@mui/icons-material/Person';
import API_BASE_URL from '../config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users. Admin access required.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async (id, endpoint, method = 'put', body = {}) => {
    setActionLoading(id);
    try {
      await axios({
        method,
        url: `${API_BASE_URL}/user/${endpoint}`,
        data: body,
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredUsers = users.filter(user => {
    if (tabValue === 0) return user.role === 'incharge';
    if (tabValue === 1) return user.role === 'family';
    return true;
  });

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 2 }}>
      <CircularProgress thickness={5} size={60} sx={{ color: '#6366F1' }} />
      <Typography variant="body2" color="textSecondary" fontWeight={700}>Loading User Records...</Typography>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', pb: 10 }}>
      {/* Premium Header Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', 
          pt: { xs: 4, sm: 6 }, 
          pb: { xs: 10, sm: 12 }, 
          px: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          mb: -6
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={900} color="#fff" sx={{ letterSpacing: '-2px', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
            User Control
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.8)" fontWeight={500} sx={{ maxWidth: 500, lineHeight: 1.4 }}>
            Direct access to directory permissions and parish oversight.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, position: 'relative', zIndex: 2 }}>
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 4, borderRadius: 4, fontWeight: 700, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}>{error}</Alert>
          </Fade>
        )}

        {/* Tab Control */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 5, 
            mb: 4, 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(255,255,255,0.9)'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, v) => setTabValue(v)} 
            variant="fullWidth"
            sx={{ 
              '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' },
              '& .MuiTab-root': { py: 3, fontWeight: 800, fontSize: '0.9rem', color: '#64748B' },
              '& .Mui-selected': { color: '#4F46E5 !important' }
            }}
          >
            <Tab label="Incharge Panel" />
            <Tab label="Family Users" />
          </Tabs>
        </Paper>

        <Stack spacing={2}>
          {filteredUsers.map((user, index) => (
            <Fade in timeout={300 + (index * 50)} key={user.id}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  border: expandedId === user.id ? '2px solid #6366F1' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: expandedId === user.id ? '0 20px 40px rgba(99, 102, 241, 0.1)' : '0 4px 12px rgba(0,0,0,0.015)',
                  overflow: 'hidden',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': { transform: expandedId === user.id ? 'none' : 'translateY(-2px)', boxShadow: '0 12px 25px rgba(0,0,0,0.04)' }
                }}
                onClick={() => toggleExpand(user.id)}
              >
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                  {/* Compact Card Header */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                      sx={{ 
                        background: user.role === 'admin' ? '#EF4444' : user.role === 'incharge' ? '#6366F1' : '#1E3A8A', 
                        width: 44, 
                        height: 44,
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={900} color="#1E293B" sx={{ lineHeight: 1.2 }}>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 12 }} /> {user.anbiyam || 'Not Assigned'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={user.is_approved ? "ACTIVE" : "PENDING"} 
                          size="small" 
                          color={user.is_approved ? "success" : "warning"}
                          sx={{ fontWeight: 900, fontSize: '0.6rem', height: 20, borderRadius: 1.5 }} 
                        />
                        <Box sx={{ 
                          color: '#CBD5E1', 
                          transform: expandedId === user.id ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s'
                        }}>
                          <FingerprintIcon sx={{ fontSize: 20 }} />
                        </Box>
                    </Box>
                  </Stack>

                  {/* Expanded Content */}
                  <Collapse in={expandedId === user.id} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 2.5, opacity: 0.5 }} />
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 4 }}>
                      <InfoBlock icon={<FingerprintIcon sx={{ fontSize: 18, color: '#6366F1' }} />} label="Email" value={user.email} />
                      <InfoBlock icon={<PhoneIphoneIcon sx={{ fontSize: 18, color: '#10B981' }} />} label="Mobile" value={user.mobile || 'N/A'} />
                      <InfoBlock icon={<PersonIcon sx={{ fontSize: 18, color: '#F59E0B' }} />} label="Family Head" value={user.head_name || 'Not Linked'} primary />
                      <InfoBlock icon={<FingerprintIcon sx={{ fontSize: 18, color: '#3B82F6' }} />} label="Family ID" value={user.family_id || 'N/A'} primary />
                    </Box>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} onClick={(e) => e.stopPropagation()}>
                      {!user.is_approved ? (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleAction(user.id, `approve/${user.id}`)}
                          startIcon={<CheckCircleIcon />}
                          disabled={actionLoading === user.id}
                          sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, textTransform: 'none', background: '#10B981', '&:hover': { background: '#059669' } }}
                        >
                          Approve Account
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleAction(user.id, `restrict/${user.id}`)}
                          startIcon={<BlockIcon />}
                          disabled={actionLoading === user.id}
                          sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, textTransform: 'none', background: '#F59E0B', '&:hover': { background: '#D97706' } }}
                        >
                          Restrict Account
                        </Button>
                      )}

                      <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', md: 'auto' } }}>
                        {user.role !== 'admin' && (
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleAction(user.id, `update-role/${user.id}`, 'put', { role: user.role === 'family' ? 'incharge' : 'family' })}
                            sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none', minWidth: 150, borderColor: '#E2E8F0', color: '#64748B' }}
                          >
                            Set to {user.role === 'family' ? 'Incharge' : 'Family'}
                          </Button>
                        )}
                        <IconButton 
                          onClick={() => handleAction(user.id, `toggle-admin/${user.id}`, 'put', { isAdmin: !user.is_admin })}
                          sx={{ bgcolor: user.is_admin ? '#FEF2F2' : '#F1F5F9', borderRadius: 3, color: user.is_admin ? '#E11D48' : '#64748B' }}
                          disabled={actionLoading === user.id}
                        >
                          <AdminPanelSettingsIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => { if (window.confirm('Delete user permanently?')) handleAction(user.id, `${user.id}`, 'delete'); }}
                          sx={{ bgcolor: '#FEF2F2', borderRadius: 3, color: '#EF4444' }}
                          disabled={actionLoading === user.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Collapse>
                </Box>
              </Card>
            </Fade>
          ))}
        </Stack>

        {filteredUsers.length === 0 && (
          <Fade in>
            <Box textAlign="center" py={12} sx={{ bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '2px dashed #E2E8F0' }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#F1F5F9', color: '#94A3B8', mx: 'auto', mb: 3 }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" color="#64748B" fontWeight={800}>No user records found</Typography>
              <Typography variant="body2" color="textSecondary">Try switching tabs or check your database connection.</Typography>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

const InfoBlock = ({ icon, label, value, primary = false }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Box 
      sx={{ 
        width: 48, height: 48, borderRadius: 3, 
        bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #F1F5F9'
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1.5, fontSize: '0.65rem' }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={primary ? 900 : 700} color={primary ? '#1E3A8A' : '#334155'}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default UserManagement;
