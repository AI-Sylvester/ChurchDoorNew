import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, TextField, Button, Alert } from '@mui/material';
import API_BASE_URL from '../../config';
import AssessmentIcon from '@mui/icons-material/Assessment';

const SubmitReport = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/incharge/report`, {
        event_name: eventName,
        event_date: eventDate,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Event report submitted successfully!');
      setEventName('');
      setEventDate('');
      setDescription('');
    } catch (err) {
      setError('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, pb: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ fontSize: 60, color: '#4F46E5', mb: 1 }} />
          <Typography variant="h5" fontWeight={900}>Submit Event Report</Typography>
          <Typography variant="body2" color="textSecondary">Report activities conducted in your Anbiyam group.</Typography>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Event Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              py: 2, 
              borderRadius: 3, 
              fontWeight: 800, 
              background: 'linear-gradient(45deg, #4F46E5, #6366F1)'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SubmitReport;
