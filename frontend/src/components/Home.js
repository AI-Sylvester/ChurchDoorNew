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
  Chip,
  Grid,
  Fade,
  Paper,
} from '@mui/material';

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import GroupIcon from '@mui/icons-material/Group';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HistoryIcon from '@mui/icons-material/History';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedIcon from '@mui/icons-material/Verified';

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

  const [hasFamily, setHasFamily] = useState(true); // Default true to avoid flash
  const [familyStatus, setFamilyStatus] = useState(null);

  const [todayReminders, setTodayReminders] = useState({ birthdays: 0, weddings: 0 });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const role = localStorage.getItem('role') || 'family';
  const userName = localStorage.getItem('username') || 'User';
  const anbiyamName = localStorage.getItem('anbiyam');

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

    const checkFamily = async () => {
      if (role === 'family') {
        try {
          const res = await fetch(`${API_BASE_URL}/family-user/check-registration`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setHasFamily(data.hasFamily);
          if (data.hasFamily && data.family) {
            setFamilyStatus(data.family.verification_status);
          }
        } catch (err) {
          setHasFamily(false);
        }
      }
    };

    fetchCounts();
    checkFamily();
  }, [token, role]);

  const statsList = [];
  if (role === 'admin') {
    statsList.push(
      { label: 'Families', value: counts.families, icon: <HomeWorkIcon />, color: '#F59E0B' },
      { label: 'Members', value: counts.members, icon: <GroupIcon />, color: '#3B82F6' },
      { label: 'Male', value: counts.male, icon: <MaleIcon />, color: '#0EA5E9' },
      { label: 'Female', value: counts.female, icon: <FemaleIcon />, color: '#EC4899' }
    );
  } else {
    statsList.push(
      { label: 'Families', value: counts.families, icon: <HomeWorkIcon />, color: '#F59E0B' },
      { label: 'Members', value: counts.members, icon: <GroupIcon />, color: '#3B82F6' },
      { label: 'Today B-Day', value: todayReminders.birthdays, icon: <CakeRoundedIcon />, color: '#E11D48' }
    );
  }

  const actions = [];
  if (role === 'admin') {
    actions.push(
      { title: 'User Approvals', subtitle: 'Manage registrations', path: '/approvals', icon: <ManageAccountsIcon />, color: '#BE123C' },
      { title: 'Update Requests', subtitle: 'Review family edits', path: '/updates', icon: <InfoOutlinedIcon />, color: '#4F46E5' },
      { title: 'Event Reports', subtitle: 'View group activities', path: '/reports', icon: <BarChartIcon />, color: '#0EA5E9' },
      { title: 'Family List', subtitle: 'Manage all families', path: '/familylist', icon: <Diversity3RoundedIcon />, color: '#1E3A8A' },
      { title: 'Member List', subtitle: 'Manage all members', path: '/memlist', icon: <GroupRoundedIcon />, color: '#64748B' },
      { title: 'User Management', subtitle: 'Incharge & Users', path: '/user-management', icon: <ManageAccountsIcon />, color: '#BE123C' },
      { title: 'Anbiyam Master', subtitle: 'Manage Anbiyams', path: '/anbiyam', icon: <ManageAccountsIcon />, color: '#FB923C' },
      { title: 'Statistics', subtitle: 'Detailed counts', path: '/stats', icon: <BarChartIcon />, color: '#0EA5E9' },
      { title: 'Family Info', subtitle: 'Detailed data', path: '/familydet', icon: <InfoOutlinedIcon />, color: '#4F46E5' },
      { title: 'Family Map', subtitle: 'Geo distribution', path: '/familymap', icon: <MapRoundedIcon />, color: '#0284C7' },
      { title: 'Contact Book', subtitle: 'Phone directory', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  } else if (role === 'incharge') {
    actions.push(
      { title: 'My Anbiyam', subtitle: `Manage ${anbiyamName}`, path: '/anbiyamfam', icon: <MapRoundedIcon />, color: '#7C3AED' },
      { title: 'Verify Registrations', subtitle: 'Vet new families', path: '/verify-registrations', icon: <VerifiedUserIcon />, color: '#10B981' },
      { title: 'Group Updates', subtitle: 'Verify change requests', path: '/group-updates', icon: <HistoryIcon />, color: '#F59E0B' },
      { title: 'Submit Report', subtitle: 'Group event report', path: '/submit-report', icon: <BarChartIcon />, color: '#0EA5E9' },
      { title: 'Family Cards', subtitle: 'View group cards', path: '/familycard', icon: <Diversity3RoundedIcon />, color: '#1E3A8A' },
      { title: 'Reminders', subtitle: 'Birthdays & More', path: '/birthdays', icon: <CakeRoundedIcon />, color: '#E11D48' },
      { title: 'Contact Book', subtitle: 'Anbiyam Contacts', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  } else {
    // Family role
    if (hasFamily) {
      actions.push(
        { title: 'My Family', subtitle: 'View your details', path: '/my-family', icon: <Diversity3RoundedIcon />, color: '#1E3A8A' },
        { title: 'Anbiyam Group', subtitle: 'Short view of group', path: '/anbiyam-summary', icon: <MapRoundedIcon />, color: '#7C3AED' },
        { title: 'Subscriptions', subtitle: 'Monthly payments', path: '/payments', icon: <BarChartIcon />, color: '#059669' },
        { title: 'Donations', subtitle: 'Support the church', path: '/donations', icon: <CakeRoundedIcon />, color: '#E11D48' },
        { title: 'Update Request', subtitle: 'Change family details', path: '/raise-update', icon: <InfoOutlinedIcon />, color: '#4F46E5' }
      );
    } else {
      actions.push(
        { title: 'Submit Registration', subtitle: 'ACTION REQUIRED', path: '/add-family', icon: <VerifiedUserIcon />, color: '#BE123C' },
        { title: 'Anbiyam Contacts', subtitle: 'View group directory', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
      );
    }
    actions.push(
      { title: 'Contact Book', subtitle: 'Anbiyam Contacts', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#F8FAFC">
        <CircularProgress thickness={5} size={60} sx={{ color: '#1E3A8A' }} />
      </Box>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
        {/* Dynamic Header */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
            pt: 5, 
            pb: 10, 
            px: 3, 
            borderBottomLeftRadius: { xs: 40, md: 60 }, 
            borderBottomRightRadius: { xs: 40, md: 60 },
            boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Background Pattern */}
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <Fade in timeout={800}>
            <Box>
              <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }}>
                {todayStr}
              </Typography>
              <Typography variant="h3" fontWeight={900} color="#fff" sx={{ letterSpacing: '-1.5px', mb: 1 }}>
                Hello, {userName}!
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" color="rgba(255,255,255,0.9)" fontWeight={500}>
                  Parish Dashboard
                </Typography>
                {localStorage.getItem('anbiyam') && !isAdmin && (
                  <Chip 
                    label={localStorage.getItem('anbiyam')} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, backdropFilter: 'blur(5px)' }} 
                  />
                )}
              </Stack>
            </Box>
          </Fade>
        </Box>

        {/* Floating Modern Stats Grid */}
        <Box sx={{ px: 2, mt: -6 }}>
          <Grid container spacing={2}>
            {statsList.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Fade in timeout={1000 + (index * 200)}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      borderRadius: 5, 
                      boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      textAlign: 'center',
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'translateY(-4px)' }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 44, 
                        height: 44, 
                        bgcolor: `${stat.color}15`, 
                        color: stat.color, 
                        mx: 'auto', 
                        mb: 1.5,
                        borderRadius: 2
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight={900} color="#1E293B">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                      {stat.label}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Registration Status Tracker for Families */}
        {role === 'family' && hasFamily && familyStatus !== 'approved' && (
          <Box sx={{ px: 2, mt: 5 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 5, 
                bgcolor: '#fff', 
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="subtitle1" fontWeight={900} color="#1E293B" mb={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <PendingActionsIcon sx={{ mr: 1, color: '#4F46E5' }} />
                Registration Roadmap
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                {[
                  { label: 'Submitted', active: true, icon: <CheckCircleOutlineIcon />, color: '#10B981' },
                  { label: 'Incharge Vetting', active: familyStatus === 'recommended', icon: familyStatus === 'recommended' ? <CheckCircleOutlineIcon /> : <HourglassEmptyIcon />, color: familyStatus === 'recommended' ? '#10B981' : '#F59E0B' },
                  { label: 'Admin Approval', active: false, icon: <VerifiedIcon />, color: '#94A3B8' }
                ].map((step, idx) => (
                  <Grid item xs={4} key={idx} sx={{ textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 40, height: 40, borderRadius: '50%', 
                      bgcolor: `${step.color}15`, color: step.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      mx: 'auto', mb: 1, border: step.active ? `2px solid ${step.color}` : '2px dashed #E2E8F0'
                    }}>
                      {step.icon}
                    </Box>
                    <Typography variant="caption" fontWeight={800} color={step.active ? '#1E293B' : 'textSecondary'} sx={{ display: 'block', textTransform: 'uppercase' }}>
                      {step.label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Action Cards Grid */}
        <Box sx={{ px: 2, mt: 5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} px={1}>
            <Typography variant="h5" fontWeight={900} color="#1E293B">
              Quick Services
            </Typography>
            <Typography variant="caption" color="primary" fontWeight={800} sx={{ cursor: 'pointer' }}>
              VIEW ALL
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {actions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={1200 + (index * 100)}>
                  <Card 
                    sx={{ 
                      borderRadius: 5, 
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.1)',
                        borderColor: 'rgba(30, 58, 138, 0.1)',
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={() => navigate(action.path)}
                      sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            bgcolor: `${action.color}12`, 
                            color: action.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2.5,
                            borderRadius: 4,
                            boxShadow: `0 8px 16px ${action.color}15`
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} color="#1E293B" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="#64748B" fontWeight={500}>
                            {action.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: '#F1F5F9', color: '#94A3B8' }}>
                        <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    </CardActionArea>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Snackbar 
          open={notificationOpen} 
          autoHideDuration={6000} 
          onClose={() => setNotificationOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setNotificationOpen(false)} 
            severity="info" 
            variant="filled"
            sx={{ 
              width: '100%', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
              borderRadius: 3,
              fontWeight: 700,
              bgcolor: '#1E3A8A'
            }}
          >
            {`Today: ${todayReminders.birthdays} Birthdays & ${todayReminders.weddings} Anniversaries!`}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default Home;
