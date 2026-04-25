import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Avatar,
  Stack,
  CardActionArea,
  Snackbar,
  Alert,
  Badge,
  Chip,
} from '@mui/material';

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupIcon from '@mui/icons-material/Group';
import ContactsIcon from '@mui/icons-material/Contacts';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import API_BASE_URL from '../config';

const Home = () => {
  const navigate = useNavigate();
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

  const [todayReminders, setTodayReminders] = useState({ birthdays: 0, weddings: 0 });
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [familyRes, memberRes, anbiyamRes, genderRes, ageGroupRes, bdayRes, weddingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/family/stats/families`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/members`, { headers }),
          fetch(`${API_BASE_URL}/anbiyam/stats/count`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/gender`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/age-groups`, { headers }),
          fetch(`${API_BASE_URL}/member/birthdays`, { headers }),
          fetch(`${API_BASE_URL}/member/weddings`, { headers }),
        ]);

        const [familyData, memberData, anbiyamData, genderData, ageData, bdayData, weddingData] = await Promise.all([
          familyRes.json(),
          memberRes.json(),
          anbiyamRes.json(),
          genderRes.json(),
          ageGroupRes.json(),
          bdayRes ? bdayRes.json() : { today: [] },
          weddingRes ? weddingRes.json() : { today: [] },
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

        const bdaysToday = bdayData.today?.length || 0;
        const weddingsToday = weddingData.today?.length || 0;
        
        setTodayReminders({ birthdays: bdaysToday, weddings: weddingsToday });
        if (bdaysToday > 0 || weddingsToday > 0) {
          setNotificationOpen(true);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [token]);

  const stats = [
    { title: 'Families', count: counts.families, icon: <HomeWorkIcon fontSize="small" />, color: '#F59E0B' },
    { title: 'Members', count: counts.members, icon: <GroupIcon fontSize="small" />, color: '#3B82F6' },
  ];

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const actions = [
    { title: 'Contact Book', subtitle: 'Mobile-style phone directory', path: '/contacts', icon: <ContactsIcon />, color: '#10B981' },
    { title: 'Family Card', subtitle: 'View and print family cards', path: '/familycard', icon: <ContactsIcon />, color: '#1E3A8A' },
    { title: 'Family Map', subtitle: 'Geographical distribution', path: '/familymap', icon: <MapRoundedIcon />, color: '#0284C7' },
    { title: 'Reminders', subtitle: 'Birthdays & Anniversaries', path: '/birthdays', icon: <Badge badgeContent={todayReminders.birthdays + todayReminders.weddings} color="error"><CakeRoundedIcon /></Badge>, color: '#E11D48' },
    { title: 'Family Info', subtitle: 'Detailed family data', path: '/familydet', icon: <InfoOutlinedIcon />, color: '#4F46E5' },
    { title: 'Add Member', subtitle: 'Register a new individual', path: '/add-member', icon: <PersonAddAltRoundedIcon />, color: '#059669' },
    { title: 'Anbiyam List', subtitle: 'View Anbiyam families', path: '/anbiyamfam', icon: <Diversity3RoundedIcon />, color: '#7C3AED' },
    { title: 'Anbiyam Master', subtitle: 'Edit Anbiyam names/details', path: '/anbiyam', icon: <Diversity3RoundedIcon />, color: '#FB923C' },
    { title: 'Statistics', subtitle: 'Detailed age & group counts', path: '/stats', icon: <BarChartIcon />, color: '#0EA5E9' },
    { title: 'Inactive List', subtitle: 'View inactive church members', path: '/memlist', icon: <GroupRoundedIcon />, color: '#64748B' },
  ];

  if (isAdmin) {
    actions.push({ title: 'User Management', subtitle: 'Approve & manage app users', path: '/user-management', icon: <ManageAccountsIcon />, color: '#BE123C' });
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Get current date for the header
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pb: 10 }}>
      {/* Hero Banner Area */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
          pt: 4, 
          pb: 8, 
          px: 3, 
          borderBottomLeftRadius: 32, 
          borderBottomRightRadius: 32,
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)'
        }}
      >
        <Typography variant="body2" color="rgba(255,255,255,0.7)" fontWeight={600} mb={0.5}>
          {today}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="#fff">
          Dashboard
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Typography variant="subtitle1" color="rgba(255,255,255,0.9)">
            Welcome to ChurchDoor
          </Typography>
          {localStorage.getItem('anbiyam') && !isAdmin && (
            <Chip 
              label={localStorage.getItem('anbiyam')} 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }} 
            />
          )}
        </Stack>
      </Box>

      {/* Floating Stats Area */}
      <Box sx={{ px: 2, mt: -5 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              sx={{ 
                flex: 1, 
                p: 2, 
                borderRadius: 4, 
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}
            >
              <Stack alignItems="center" spacing={1} mb={1}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="body2" color="textSecondary" fontWeight={600}>
                  {stat.title}
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800} color="#1E3A8A">
                {stat.count}
              </Typography>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Vertical Action List */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Typography variant="h6" fontWeight={700} color="#1E293B" mb={2} px={1}>
          Quick Actions
        </Typography>

        <Stack spacing={2}>
          {actions.map((action, index) => (
            <Card 
              key={index}
              sx={{ 
                borderRadius: 4, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(action.path)}
                sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      bgcolor: `${action.color}10`, 
                      color: action.color,
                      mr: 2,
                      borderRadius: 3
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#1E293B">
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {action.subtitle}
                    </Typography>
                  </Box>
                </Box>
                <ChevronRightRoundedIcon sx={{ color: '#94A3B8' }} />
              </CardActionArea>
            </Card>
          ))}
        </Stack>
      </Box>

      <Snackbar 
        open={notificationOpen} 
        autoHideDuration={6000} 
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="info" sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
          {`You have ${todayReminders.birthdays} birthday(s) and ${todayReminders.weddings} anniversary(s) today!`}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
