import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupIcon from '@mui/icons-material/Group';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import API_BASE_URL from '../config';

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

  const metrics = [
    {
      title: 'Total Families',
      count: counts.families,
      icon: <HomeWorkIcon fontSize="large" />,
      color: '#fbc02d',
    },
    {
      title: 'Total Members',
      count: counts.members,
      icon: <GroupIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Total Anbiyams',
      count: counts.anbiyams,
      icon: <LocationCityIcon fontSize="large" />,
      color: '#7b1fa2',
    },
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 5, bgcolor: '#ffffffff' }}>
      

      <Grid container spacing={4} justifyContent="center">
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: metric.color,
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {metric.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                      {metric.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="text.primary"
                      mt={0.5}
                    >
                      {metric.count}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
