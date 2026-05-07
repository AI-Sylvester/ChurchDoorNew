import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Grid, Card, CardContent, Avatar } from '@mui/material';
import API_BASE_URL from '../../config';
import GroupsIcon from '@mui/icons-material/Groups';

const AnbiyamSummary = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const anbiyam = localStorage.getItem('anbiyam');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/family-user/anbiyam-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFamilies(res.data);
      } catch (err) {
        setError('Failed to load Anbiyam summary');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, pb: 10 }}>
      <Typography variant="h4" fontWeight={900} color="#1E3A8A" gutterBottom>{anbiyam} Group</Typography>
      <Typography variant="body1" color="textSecondary" mb={4}>Directory of families in your Anbiyam.</Typography>

      <Grid container spacing={2}>
        {families.map((fam) => (
          <Grid item xs={12} sm={6} md={4} key={fam.family_id}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#4F46E5', mr: 2 }}><GroupsIcon /></Avatar>
                <Box>
                  <Typography fontWeight={700} sx={{ lineHeight: 1.2 }}>{fam.head_name}</Typography>
                  <Typography variant="caption" color="textSecondary">{fam.family_id} • {fam.city}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AnbiyamSummary;
