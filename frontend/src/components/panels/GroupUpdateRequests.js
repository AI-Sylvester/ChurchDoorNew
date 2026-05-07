import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import API_BASE_URL from '../../config';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GroupUpdateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/incharge/update-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to load group update requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/verify-update/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.filter(r => r.id !== id));
      alert('Request verified and sent to Admin!');
    } catch (err) {
      alert('Failed to verify request');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Group Update Requests</Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>Verify change requests from your group families.</Typography>

      {requests.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
          <Typography variant="h6">No pending requests!</Typography>
          <Typography color="textSecondary">All update requests for your group have been verified.</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          {requests.map((req, idx) => (
            <React.Fragment key={req.id}>
              <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}><HistoryIcon color="primary" /></Box>
                <ListItemText
                  primary={<Typography variant="h6" fontWeight={700}>{req.head_name}</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textPrimary"><strong>Changes Requested:</strong></Typography>
                      <Box sx={{ bgcolor: '#F1F5F9', p: 1.5, borderRadius: 2, mt: 0.5, fontSize: '0.85rem' }}>
                        {Object.entries(req.requested_data).map(([key, val]) => (
                          <div key={key}><strong>{key}:</strong> {String(val)}</div>
                        ))}
                      </Box>
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                        Submitted on: {new Date(req.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleVerify(req.id)}
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', ml: 2, alignSelf: 'center' }}
                >
                  Verify Request
                </Button>
              </ListItem>
              {idx < requests.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default GroupUpdateRequests;
