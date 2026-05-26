import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Avatar,
  CardActionArea,
  Snackbar,
  Alert,
  Chip,
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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import VerifiedIcon from '@mui/icons-material/Verified';

import API_BASE_URL from '../config';

const Home = () => {
  const navigate = useNavigate();
  
  const [counts, setCounts] = useState({
    families: 0,
    members: 0,
    male: 0,
    female: 0,
  });

  const [hasFamily, setHasFamily] = useState(true);
  const [familyStatus, setFamilyStatus] = useState(null);

  const [todayReminders, setTodayReminders] = useState({ birthdays: 0, weddings: 0 });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'family';
  const userName = localStorage.getItem('username') || 'User';
  const anbiyamName = localStorage.getItem('anbiyam');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [familyRes, memberRes, genderRes, bdayRes, weddingRes, statusRes] = await Promise.all([
          fetch(`${API_BASE_URL}/family/stats/families`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/members`, { headers }),
          fetch(`${API_BASE_URL}/member/stats/gender`, { headers }),
          fetch(`${API_BASE_URL}/member/birthdays`, { headers }),
          fetch(`${API_BASE_URL}/member/weddings`, { headers }),
          fetch(`${API_BASE_URL}/family-user/check-registration`, { headers })
        ]);

        const [familyData, memberData, genderData, bdayData, weddingData, statusData] = await Promise.all([
          familyRes.json(),
          memberRes.json(),
          genderRes.json(),
          bdayRes ? bdayRes.json() : { today: [] },
          weddingRes ? weddingRes.json() : { today: [] },
          statusRes.json()
        ]);

        setCounts({
          families: familyData.count || 0,
          members: memberData.count || 0,
          male: genderData.male_count || 0,
          female: genderData.female_count || 0,
        });

        setTodayReminders({
          birthdays: bdayData.today?.length || 0,
          weddings: weddingData.today?.length || 0,
        });

        if (bdayData.today?.length > 0 || weddingData.today?.length > 0) {
          setNotificationOpen(true);
        }

        setHasFamily(statusData.hasFamily);
        setFamilyStatus(statusData.family?.verification_status);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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
      { title: 'User Approvals', subtitle: 'Manage registrations', path: '/approvals?tab=0', icon: <ManageAccountsIcon />, color: '#BE123C' },
      { title: 'Family Approvals', subtitle: 'Vet families', path: '/approvals?tab=1', icon: <HomeWorkIcon />, color: '#10B981' },
      { title: 'Member Approvals', subtitle: 'Vet individuals', path: '/approvals?tab=2', icon: <GroupRoundedIcon />, color: '#3B82F6' },
      { title: 'Update Requests', subtitle: 'Review family edits', path: '/approvals?tab=3', icon: <InfoOutlinedIcon />, color: '#4F46E5' },
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
      { title: 'Add Member', subtitle: 'Register new individual', path: '/add-member', icon: <PersonAddAltRoundedIcon />, color: '#3B82F6' },
      { title: 'Verify Families', subtitle: 'Vet new families', path: '/verify-registrations?tab=0', icon: <HomeWorkIcon />, color: '#10B981' },
      { title: 'Verify Members', subtitle: 'Vet individuals', path: '/verify-registrations?tab=1', icon: <Diversity3RoundedIcon />, color: '#3B82F6' },
      { title: 'Verify Accounts', subtitle: 'Vet users', path: '/verify-registrations?tab=2', icon: <VerifiedUserIcon />, color: '#8B5CF6' },
      { title: 'Group Updates', subtitle: 'Verify change requests', path: '/verify-registrations?tab=3', icon: <HistoryIcon />, color: '#F59E0B' },
      { title: 'Submit Report', subtitle: 'Group event report', path: '/submit-report', icon: <BarChartIcon />, color: '#0EA5E9' },
      { title: 'Family Cards', subtitle: 'View group cards', path: '/familycard', icon: <Diversity3RoundedIcon />, color: '#1E3A8A' },
      { title: 'Reminders', subtitle: 'Birthdays & More', path: '/birthdays', icon: <CakeRoundedIcon />, color: '#E11D48' },
      { title: 'Contact Book', subtitle: 'Anbiyam Contacts', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  } else {
    if (!hasFamily) {
      actions.push(
        { title: 'Submit Registration', subtitle: 'ACTION REQUIRED', path: '/add-family', icon: <VerifiedUserIcon />, color: '#BE123C' }
      );
    }
    actions.push(
      { title: 'My Family', subtitle: 'View your profile', path: '/my-family', icon: <Diversity3RoundedIcon />, color: '#4F46E5' },
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
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} color="#fff" sx={{ letterSpacing: '-1.5px', mb: 0.5 }}>
                Hello, {userName}
              </Typography>
              <Typography variant="subtitle2" color="rgba(255,255,255,0.8)" fontWeight={600}>
                {todayStr} • {anbiyamName || 'Main Parish'}
              </Typography>
            </Box>
            <Chip 
              label={role.toUpperCase()} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: '#fff', 
                fontWeight: 900, 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '0.65rem'
              }} 
            />
          </Box>

          <Box 
            sx={{ 
              mt: 4, 
              position: 'relative', 
              zIndex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            {statsList.map((stat, idx) => (
              <Box 
                key={idx}
                sx={{ 
                  flex: '1 1 calc(50% - 12px)',
                  minWidth: { xs: 'calc(50% - 12px)', sm: '120px' },
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(15px)',
                  p: 2, 
                  borderRadius: 4, 
                  border: '1px solid rgba(255,255,255,0.2)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Box sx={{ color: '#fff', mb: 0.5 }}>{stat.icon}</Box>
                <Typography variant="h6" fontWeight={900} color="#fff">{stat.value}</Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight={700}>{stat.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {role?.toLowerCase() === 'family' && familyStatus && familyStatus !== 'approved' && (
          <Box sx={{ px: 2, mt: -4, position: 'relative', zIndex: 2 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 5, 
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.02)'
              }}
            >
              <Typography variant="subtitle1" fontWeight={900} color="#1E293B" mb={3} textAlign="center">
                Registration Roadmap
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {[
                  { label: 'Register', active: true, icon: <CheckCircleOutlineIcon />, color: '#10B981' },
                  { 
                    label: 'Vetting', 
                    active: familyStatus === 'recommended' || familyStatus === 'approved', 
                    icon: (familyStatus === 'recommended' || familyStatus === 'approved') ? <CheckCircleOutlineIcon /> : <HourglassEmptyIcon />, 
                    color: (familyStatus === 'recommended' || familyStatus === 'approved') ? '#10B981' : '#F59E0B' 
                  },
                  { 
                    label: 'Approved', 
                    active: familyStatus === 'approved', 
                    icon: familyStatus === 'approved' ? <VerifiedIcon /> : <VerifiedIcon sx={{ opacity: 0.3 }} />, 
                    color: familyStatus === 'approved' ? '#10B981' : '#94A3B8' 
                  }
                ].map((step, idx) => (
                  <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box sx={{ 
                      width: 44, height: 44, borderRadius: '50%', 
                      bgcolor: `${step.color}15`, color: step.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      mx: 'auto', mb: 1, 
                      border: step.active ? `2.5px solid ${step.color}` : '2px dashed #E2E8F0',
                      boxShadow: step.active ? `0 0 15px ${step.color}30` : 'none'
                    }}>
                      {step.icon}
                    </Box>
                    <Typography variant="caption" fontWeight={900} color={step.active ? '#1E293B' : '#94A3B8'} sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        <Box sx={{ px: 3, mt: 4, position: 'relative', zIndex: 2 }}>
          <Typography variant="overline" color="textSecondary" fontWeight={900} sx={{ letterSpacing: 1, ml: 1, mb: 1.5, display: 'block' }}>
            Quick Services
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {actions.map((action, idx) => (
              <Card 
                key={idx} 
                sx={{ 
                  borderRadius: 5, 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)', 
                  border: '1px solid #F1F5F9',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:active': { transform: 'scale(0.97)', bgcolor: '#F8FAFC' }
                }}
              >
                <CardActionArea onClick={() => navigate(action.path)} sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: `${action.color}15`, 
                          color: action.color, 
                          mr: 2.5, 
                          width: 52, 
                          height: 52,
                          boxShadow: `0 8px 20px ${action.color}15`
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={900} color="#1E293B" sx={{ lineHeight: 1.2 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight={600}>
                          {action.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRightRoundedIcon sx={{ color: '#CBD5E1' }} />
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
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
