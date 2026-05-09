import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
  Card,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import API_BASE_URL from '../config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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

  const filteredUsers = users.filter(user => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return user.role === 'incharge';
    if (tabValue === 2) return user.role === 'family';
    return true;
  });

  if (loading) return <Box textAlign="center" py={10}><CircularProgress thickness={5} size={60} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom sx={{ letterSpacing: '-1px' }}>
          User Control
        </Typography>
        <Typography variant="body1" color="textSecondary" fontWeight={500}>
          Manage account permissions, roles, and administrative access.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 4, mb: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ bgcolor: '#fff' }}
        >
          <Tab label="All Users" sx={{ fontWeight: 800, py: 2.5 }} />
          <Tab label="Incharges" sx={{ fontWeight: 800, py: 2.5 }} />
          <Tab label="Family Users" sx={{ fontWeight: 800, py: 2.5 }} />
        </Tabs>
      </Paper>

      <Stack spacing={2.5}>
        {filteredUsers.map((user) => (
          <Card 
            key={user.id} 
            sx={{ 
              borderRadius: 5, 
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
              overflow: 'hidden',
              transition: 'transform 0.2s',
              '&:hover': { boxShadow: '0 15px 40px rgba(0,0,0,0.04)' }
            }}
          >
            <Box sx={{ p: 3 }}>
              {/* User Header */}
              <Stack direction="row" spacing={2.5} alignItems="center" mb={3}>
                <Avatar 
                  sx={{ 
                    bgcolor: user.role === 'admin' ? '#E11D48' : user.role === 'incharge' ? '#4F46E5' : '#1E3A8A', 
                    width: 60, 
                    height: 60,
                    fontWeight: 900,
                    fontSize: '1.5rem',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ mb: 0.5 }}>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" fontWeight={600}>
                    {user.email}
                  </Typography>
                </Box>
                <Stack direction="column" spacing={1} alignItems="flex-end">
                    {user.role === 'admin' ? (
                      <Chip label="ADMIN" size="small" sx={{ bgcolor: '#FEF2F2', color: '#E11D48', fontWeight: 900, border: '1px solid #FEE2E2', fontSize: '0.7rem' }} />
                    ) : user.role === 'incharge' ? (
                      <Chip label="INCHARGE" size="small" sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 900, border: '1px solid #E0E7FF', fontSize: '0.7rem' }} />
                    ) : (
                      <Chip label="FAMILY" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 900, border: '1px solid #DCFCE7', fontSize: '0.7rem' }} />
                    )}
                    {user.is_approved ? (
                      <Chip label="ACTIVE" size="small" color="success" sx={{ fontWeight: 900, fontSize: '0.65rem' }} />
                    ) : (
                      <Chip label="RESTRICTED" size="small" color="warning" sx={{ fontWeight: 900, fontSize: '0.65rem' }} />
                    )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 2.5, borderStyle: 'dashed', opacity: 0.6 }} />

              {/* Details Section */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                    Anbiyam
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#334155">
                    {user.anbiyam || 'None'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                    Mobile
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#334155">
                    {user.mobile || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                    Family Head
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#1E3A8A">
                    {user.head_name || 'Not Linked'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 0.5, display: 'block' }}>
                    Family ID
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#1E3A8A">
                    {user.family_id || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {!user.is_approved ? (
                  <Button
                    variant="contained"
                    fullWidth
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, `approve/${user.id}`)}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, textTransform: 'none' }}
                  >
                    Approve Account
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    color="warning"
                    startIcon={<BlockIcon />}
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, `restrict/${user.id}`)}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 900, textTransform: 'none', borderWeight: 2 }}
                  >
                    Restrict Access
                  </Button>
                )}

                <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  {user.role !== 'admin' && (
                    <Button
                      variant="outlined"
                      onClick={() => handleAction(user.id, `update-role/${user.id}`, 'put', { role: user.role === 'family' ? 'incharge' : 'family' })}
                      sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none', minWidth: 160, borderColor: '#CBD5E1', color: '#64748B' }}
                      startIcon={<AccountCircleIcon />}
                    >
                      Set as {user.role === 'family' ? 'Incharge' : 'Family'}
                    </Button>
                  )}

                  <Tooltip title={user.is_admin ? "Revoke Admin" : "Grant Admin"}>
                    <IconButton 
                      sx={{ 
                        bgcolor: user.is_admin ? '#FEF2F2' : '#F1F5F9', 
                        borderRadius: 3, 
                        color: user.is_admin ? '#E11D48' : '#64748B',
                        width: 48,
                        height: 48
                      }}
                      disabled={actionLoading === user.id}
                      onClick={() => handleAction(user.id, `toggle-admin/${user.id}`, 'put', { isAdmin: !user.is_admin })}
                    >
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Account">
                    <IconButton 
                      sx={{ bgcolor: '#FEF2F2', borderRadius: 3, color: '#E11D48', width: 48, height: 48 }}
                      disabled={actionLoading === user.id}
                      onClick={() => {
                        if (window.confirm('Delete this user account permanently?')) {
                          handleAction(user.id, `${user.id}`, 'delete');
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Card>
        ))}
      </Stack>

      {filteredUsers.length === 0 && (
        <Box textAlign="center" py={12} sx={{ bgcolor: '#fff', borderRadius: 5, border: '1px dashed #E2E8F0' }}>
          <Typography color="textSecondary" fontWeight={600}>No users found in this category.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;
