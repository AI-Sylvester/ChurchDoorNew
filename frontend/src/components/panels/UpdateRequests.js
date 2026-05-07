import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import API_BASE_URL from '../../config';

const UpdateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin-panel/update-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load update requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/admin-panel/update-requests/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to process request');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Update Requests</Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>Review requests from families to change their details.</Typography>

      {requests.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h6">No pending update requests.</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {requests.map((req, idx) => (
            <React.Fragment key={req.id}>
              <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                <ListItemText
                  primary={<Typography variant="h6" fontWeight={700}>{req.head_name} ({req.family_id})</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textPrimary" fontWeight={600}>Requested Changes:</Typography>
                      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mt: 1 }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.875rem' }}>
                          {JSON.stringify(req.requested_data, null, 2)}
                        </pre>
                      </Box>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Button variant="contained" color="success" onClick={() => handleAction(req.id, 'approved')}>Approve</Button>
                  <Button variant="outlined" color="error" onClick={() => handleAction(req.id, 'rejected')}>Reject</Button>
                </Box>
              </ListItem>
              {idx < requests.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default UpdateRequests;
