import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip } from '@mui/material';
import API_BASE_URL from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin-panel/pending-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
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

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Pending Approvals</Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>Review and approve new user registrations.</Typography>

      {users.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
          <Typography variant="h6">All caught up!</Typography>
          <Typography color="textSecondary">No pending registrations at the moment.</Typography>
        </Paper>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {users.map((user, idx) => (
            <React.Fragment key={user.id}>
              <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#4F46E5' }}><PersonIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="h6" fontWeight={700}>{user.username}</Typography>}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textPrimary">{user.mobile} • {user.email}</Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip label={user.role} size="small" variant="outlined" sx={{ fontWeight: 700, textTransform: 'capitalize' }} />
                        <Chip label={user.anbiyam} size="small" sx={{ fontWeight: 600 }} />
                      </Box>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleApprove(user.id)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
              {idx < users.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminApprovals;
