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
  Grid,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import API_BASE_URL from '../config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

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

  if (loading) return <Box textAlign="center" py={5}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2, backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>
          User Control
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Approve, restrict, or manage administrator roles.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Stack spacing={2.5}>
        {users.map((user) => (
          <Card 
            key={user.id} 
            sx={{ 
              borderRadius: 4, 
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2.5 }}>
              {/* User Header */}
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: user.is_admin ? '#E11D48' : '#1E3A8A', 
                    width: 50, 
                    height: 50,
                    fontWeight: 700
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={800} color="#1E293B" lineHeight={1.2}>
                    {user.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </Box>
                <Stack direction="column" spacing={0.5} alignItems="flex-end">
                  {user.is_admin ? (
                    <Chip label="Admin" size="small" sx={{ bgcolor: '#FEF2F2', color: '#E11D48', fontWeight: 700, border: '1px solid #FEE2E2' }} />
                  ) : (
                    <Chip label="User" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  )}
                  {user.is_approved ? (
                    <Chip label="Active" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, border: '1px solid #DCFCE7' }} />
                  ) : (
                    <Chip label="Pending" size="small" sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, border: '1px solid #FEF3C7' }} />
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

              {/* Details Section */}
              <Grid container spacing={2} mb={2.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Mobile
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    {user.mobile || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Anbiyam
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#334155">
                    {user.anbiyam || 'None'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {!user.is_approved ? (
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, `approve/${user.id}`)}
                    sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
                  >
                    Approve
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="warning"
                    startIcon={<BlockIcon />}
                    disabled={actionLoading === user.id}
                    onClick={() => handleAction(user.id, `restrict/${user.id}`)}
                    sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
                  >
                    Restrict
                  </Button>
                )}

                <IconButton 
                  sx={{ bgcolor: '#f1f5f9', borderRadius: 2, color: '#64748B' }}
                  disabled={actionLoading === user.id}
                  onClick={() => handleAction(user.id, `toggle-admin/${user.id}`, 'put', { isAdmin: !user.is_admin })}
                >
                  <Tooltip title={user.is_admin ? "Revoke Admin" : "Make Admin"}>
                    <AdminPanelSettingsIcon />
                  </Tooltip>
                </IconButton>

                <IconButton 
                  sx={{ bgcolor: '#FEF2F2', borderRadius: 2, color: '#E11D48' }}
                  disabled={actionLoading === user.id}
                  onClick={() => {
                    if (window.confirm('Delete this user account permanently?')) {
                      handleAction(user.id, `${user.id}`, 'delete');
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))}
      </Stack>

      {users.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary">No registered users found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserManagement;
