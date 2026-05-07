import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip, Tabs, Tab } from '@mui/material';
import API_BASE_URL from '../../config';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import VerifiedIcon from '@mui/icons-material/Verified';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

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

  const handleApproveFamily = async (familyId) => {
    try {
      const token = localStorage.getItem('token');
      // Admin directly updates status to approved/active
      await axios.put(`${API_BASE_URL}/family/${familyId}`, { active: true, verification_status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilies(families.filter(f => f.family_id !== familyId));
    } catch (err) {
      alert('Failed to approve family');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Pending Approvals</Typography>
      
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Users (${users.length})`} />
        <Tab label={`Families (${families.length})`} />
      </Tabs>

      {tab === 0 ? (
        <Box>
          {users.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6">No pending user registrations.</Typography>
            </Paper>
          ) : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {users.map((user, idx) => (
                <React.Fragment key={user.id}>
                  <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#4F46E5' }}><PersonIcon /></Avatar></ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="h6" fontWeight={700}>{user.username}</Typography>}
                      secondary={<Typography variant="body2">{user.mobile} • {user.role} • {user.anbiyam}</Typography>}
                    />
                    <Button variant="contained" color="success" onClick={() => handleApproveUser(user.id)}>Approve</Button>
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
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6">No pending family registrations.</Typography>
            </Paper>
          ) : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {families.map((fam, idx) => (
                <React.Fragment key={fam.family_id}>
                  <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: '#059669' }}><HomeWorkIcon /></Avatar></ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" fontWeight={700}>{fam.head_name}</Typography>
                          {fam.verification_status === 'recommended' && (
                            <Chip icon={<VerifiedIcon />} label="Recommended" size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={<Typography variant="body2">{fam.family_id} • {fam.anbiyam} • {fam.mobile_number}</Typography>}
                    />
                    <Button variant="contained" color="success" onClick={() => handleApproveFamily(fam.family_id)}>Approve</Button>
                  </ListItem>
                  {idx < families.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminApprovals;
