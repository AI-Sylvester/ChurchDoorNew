import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupIcon from '@mui/icons-material/Group';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import API_BASE_URL from '../config';

const metricStyles = {
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#0B3D91',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
  },
  value: {
    fontSize: '2rem',
    fontWeight: 'bold',
    mt: 1
  }
};

const Home = () => {
  const [counts, setCounts] = useState({ families: 0, members: 0, anbiyams: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [familyRes, memberRes, anbiyamRes] = await Promise.all([
          fetch(`${API_BASE_URL}/family/stats/families`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/members`, { headers }),
          fetch(`${API_BASE_URL}/anbiyam/stats/count`, { headers }),
        ]);
        const familyData = await familyRes.json();
        const memberData = await memberRes.json();
        const anbiyamData = await anbiyamRes.json();

        setCounts({
          families: familyData.count || 0,
          members: memberData.count || 0,
          anbiyams: anbiyamData.count || 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token]);

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 4 }}>
   {/* Header Section */}
<Paper
  elevation={2}
  sx={{
    p: 2,
    borderRadius: 2,
    mb: 3,
    backgroundColor: '#fefefe',
    borderLeft: '4px solid #42a5f5',
  }}
>
  <Typography variant="h6" fontWeight={600} color="primary" gutterBottom>
    Welcome to Church Door
  </Typography>
  <Typography variant="body2" color="text.secondary">
    Manage families, members, and Anbiyams all in one place.
  </Typography>
</Paper>

      {/* Metric Cards */}
{/* Metric Cards */}
<Box display="flex" justifyContent="center">
  <Grid container spacing={4} justifyContent="center">
    <Grid item xs={12} sm={8} md={4}>
      <Card
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(to bottom right, #e3f2fd, #bbdefb)',
          boxShadow: 3,
          p: 2
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={metricStyles.iconContainer}>
              <HomeWorkIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Total Families
              </Typography>
              <Typography sx={metricStyles.value} color="primary.dark">
                {counts.families}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} sm={8} md={4}>
      <Card
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(to bottom right, #fce4ec, #f8bbd0)',
          boxShadow: 3,
          p: 2
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ ...metricStyles.iconContainer, backgroundColor: '#ad1457' }}>
              <GroupIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Total Members
              </Typography>
              <Typography sx={metricStyles.value} color="error.dark">
                {counts.members}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} sm={8} md={4}>
      <Card
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(to bottom right, #ede7f6, #d1c4e9)',
          boxShadow: 3,
          p: 2
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ ...metricStyles.iconContainer, backgroundColor: '#6a1b9a' }}>
              <LocationCityIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Total Anbiyams
              </Typography>
              <Typography sx={metricStyles.value} color="secondary.dark">
                {counts.anbiyams}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Box>
    </Box>
  );
};

export default Home;
