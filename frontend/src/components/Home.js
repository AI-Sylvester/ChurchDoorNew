import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Avatar,
  Stack,
} from '@mui/material';

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupIcon from '@mui/icons-material/Group';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import ElderlyIcon from '@mui/icons-material/Elderly';
import SchoolIcon from '@mui/icons-material/School';
import API_BASE_URL from '../config';

const Home = () => {
  const [counts, setCounts] = useState({
    families: 0,
    members: 0,
    anbiyams: 0,
    male: 0,
    female: 0,
    children: 0,
    youth: 0,
    seniors: 0,
  });

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [familyRes, memberRes, anbiyamRes, genderRes, ageGroupRes] = await Promise.all([
          fetch(`${API_BASE_URL}/family/stats/families`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/members`, { headers }),
          fetch(`${API_BASE_URL}/anbiyam/stats/count`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/gender`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/age-groups`, { headers }),
        ]);

        const [familyData, memberData, anbiyamData, genderData, ageData] = await Promise.all([
          familyRes.json(),
          memberRes.json(),
          anbiyamRes.json(),
          genderRes.json(),
          ageGroupRes.json(),
        ]);

        setCounts({
          families: familyData.count || 0,
          members: memberData.count || 0,
          anbiyams: anbiyamData.count || 0,
          male: genderData.male_count || 0,
          female: genderData.female_count || 0,
          children: ageData.child_count || 0,
          youth: ageData.youth_count || 0,
          seniors: ageData.senior_citizen_count || 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token]);

  const metrics = [
    { title: 'Total Families', count: counts.families, icon: <HomeWorkIcon />, color: '#fbc02d' },
    { title: 'Total Members', count: counts.members, icon: <GroupIcon />, color: '#1976d2' },
    { title: 'Total Anbiyams', count: counts.anbiyams, icon: <LocationCityIcon />, color: '#7b1fa2' },
    { title: 'Male Members', count: counts.male, icon: <ManIcon />, color: '#0288d1' },
    { title: 'Female Members', count: counts.female, icon: <WomanIcon />, color: '#e91e63' },
    { title: 'Children (<16)', count: counts.children, icon: <ChildCareIcon />, color: '#4caf50' },
    { title: 'Youth (16-27)', count: counts.youth, icon: <SchoolIcon />, color: '#ff9800' },
    { title: 'Senior Citizens (55+)', count: counts.seniors, icon: <ElderlyIcon />, color: '#9e9e9e' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, backgroundColor: '#f8f8f8', minHeight: '100vh' }}>
           <Stack spacing={2}>
        {metrics.map((metric, index) => (
          <Card
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              px: 2,
              py: 2,
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                backgroundColor: '#f0f4ff',
              },
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                backgroundColor: metric.color,
                color: '#fff',
                mr: 2,
              }}
            >
              {metric.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.title}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {metric.count}
              </Typography>
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
