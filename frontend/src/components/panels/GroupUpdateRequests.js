import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import API_BASE_URL from '../../config';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FAMILY_LABELS = {
  head_name: 'Head Name',
  address_line1: 'Address Line 1',
  address_line2: 'Address Line 2',
  city: 'City',
  pincode: 'Pincode',
  mobile_number: 'Mobile Number',
  mobile_number2: 'Alternate Mobile',
  cemetery: 'Cemetery Registered',
  cemetery_number: 'Cemetery Number',
  old_card_number: 'Old Card Number',
  native: 'Native Place',
  resident_from: 'Resident From (Year)',
  house_type: 'House Type',
  subscription: 'Subscription Details',
  anbiyam: 'Anbiyam Group',
  location: 'Geo Location Pin'
};

const MEMBER_LABELS = {
  name: 'Full Name',
  sex: 'Sex',
  dob: 'Date of Birth',
  relationship: 'Relationship',
  marital_status: 'Marital Status',
  mobile: 'Mobile Number',
  qualification: 'Qualification',
  profession: 'Profession',
  church_group: 'Church Group',
  residing_here: 'Residing Here',
  active: 'Active Record',
  baptism_date: 'Baptism Date',
  baptism_place: 'Baptism Place',
  holy_communion_date: 'Holy Communion Date',
  holy_communion_place: 'Holy Communion Place',
  confirmation_date: 'Confirmation Date',
  confirmation_place: 'Confirmation Place',
  marriage_date: 'Marriage Date',
  marriage_place: 'Marriage Place'
};

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

  const renderRequestedChanges = (requestedData) => {
    let data = requestedData;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // use raw data
      }
    }

    if (data && data.edit_type) {
      const isMember = data.edit_type === 'member';
      const label = isMember ? MEMBER_LABELS[data.field_name] : FAMILY_LABELS[data.field_name];
      const fieldLabel = label || data.field_name;

      const formatVal = (val) => {
        if (val === 'true' || val === true) return 'Yes';
        if (val === 'false' || val === false) return 'No';
        if (val === null || val === undefined || val === '') return '[Empty / Unspecified]';
        return String(val);
      };

      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2">
              <strong>Target:</strong> {isMember ? <span>Member: <span style={{ color: '#1E3A8A', fontWeight: 800 }}>{data.member_name}</span> ({data.member_id})</span> : <span style={{ color: '#0F766E', fontWeight: 800 }}>Family Registration</span>}
            </Typography>
          </Box>

          {data.field_name && (
            <Typography variant="body2">
              <strong>Field:</strong> <span style={{ fontWeight: 700, color: '#475569' }}>{fieldLabel}</span>
            </Typography>
          )}

          {data.field_name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0', maxWidth: 500 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 700 }}>CURRENT VALUE</Typography>
                <Typography variant="body2" sx={{ color: '#DC2626', textDecoration: 'line-through', fontWeight: 600 }}>
                  {formatVal(data.old_value)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#94A3B8', fontWeight: 900 }}>→</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 700 }}>PROPOSED VALUE</Typography>
                <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 800 }}>
                  {formatVal(data.new_value)}
                </Typography>
              </Box>
            </Box>
          )}

          {data.additional_changes && (
            <Box sx={{ mt: 1, borderTop: '1px dashed #E2E8F0', pt: 1.5 }}>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Additional Notes & Requests</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#475569', mt: 0.5, bgcolor: '#FEF3C7', p: 1.5, borderRadius: 2, borderLeft: '4px solid #F59E0B' }}>
                {data.additional_changes}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // Fallback for legacy format
    return (
      <Box sx={{ bgcolor: '#F1F5F9', p: 1.5, borderRadius: 2, mt: 0.5, fontSize: '0.85rem' }}>
        {Object.entries(data || {}).map(([key, val]) => (
          <div key={key}><strong>{key}:</strong> {String(val)}</div>
        ))}
      </Box>
    );
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Group Update Requests</Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>Verify change requests from your group families.</Typography>

      {requests.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 2 }} />
          <Typography variant="h6">No pending requests!</Typography>
          <Typography color="textSecondary">All update requests for your group have been verified.</Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
          {requests.map((req, idx) => (
            <React.Fragment key={req.id}>
              <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                <Box sx={{ mr: 2, mt: 0.5 }}><HistoryIcon color="primary" /></Box>
                <ListItemText
                  primary={<Typography variant="h6" fontWeight={700} color="#1E293B">{req.head_name} ({req.family_id})</Typography>}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 700 }}>Changes Requested:</Typography>
                      {renderRequestedChanges(req.requested_data)}
                      <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 2 }}>
                        Submitted on: {new Date(req.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleVerify(req.id)}
                  sx={{ 
                    borderRadius: 2, 
                    fontWeight: 700, 
                    textTransform: 'none', 
                    ml: 2, 
                    alignSelf: 'center',
                    px: 3,
                    py: 1,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
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
