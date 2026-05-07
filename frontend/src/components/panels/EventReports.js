import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Card, CardContent } from '@mui/material';
import API_BASE_URL from '../../config';
import EventIcon from '@mui/icons-material/Event';

const EventReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/admin-panel/event-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data);
      } catch (err) {
        setError('Failed to load event reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>Event Reports</Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>Activities reported by Anbiyam Incharges.</Typography>

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} key={report.id}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" fontWeight={800}>{report.event_name}</Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={700}>
                    {new Date(report.event_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Anbiyam: {report.anbiyam} • Reported by: {report.incharge_name}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: '#475569' }}>
                  {report.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventReports;
