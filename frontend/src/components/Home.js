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

  const [counts, setCounts] = useState({ families: 0, members: 0, male: 0, female: 0 });
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
          fetch(`${API_BASE_URL}/family-user/check-registration`, { headers }),
        ]);

        const [familyData, memberData, genderData, bdayData, weddingData, statusData] = await Promise.all([
          familyRes.json(),
          memberRes.json(),
          genderRes.json(),
          bdayRes ? bdayRes.json() : { today: [] },
          weddingRes ? weddingRes.json() : { today: [] },
          statusRes.json(),
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
        if (bdayData.today?.length > 0 || weddingData.today?.length > 0) setNotificationOpen(true);
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
      { label: 'Families', value: counts.families, icon: <HomeWorkIcon sx={{ fontSize: 22 }} />, color: '#F59E0B' },
      { label: 'Members', value: counts.members, icon: <GroupIcon sx={{ fontSize: 22 }} />, color: '#3B82F6' },
      { label: 'Male', value: counts.male, icon: <MaleIcon sx={{ fontSize: 22 }} />, color: '#0EA5E9' },
      { label: 'Female', value: counts.female, icon: <FemaleIcon sx={{ fontSize: 22 }} />, color: '#EC4899' }
    );
  } else {
    statsList.push(
      { label: 'Families', value: counts.families, icon: <HomeWorkIcon sx={{ fontSize: 22 }} />, color: '#F59E0B' },
      { label: 'Members', value: counts.members, icon: <GroupIcon sx={{ fontSize: 22 }} />, color: '#3B82F6' },
      { label: "B-Day Today", value: todayReminders.birthdays, icon: <CakeRoundedIcon sx={{ fontSize: 22 }} />, color: '#E11D48' }
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
      { title: 'Add Family', subtitle: 'Register new family', path: '/add-family', icon: <HomeWorkIcon />, color: '#10B981' },
      { title: 'Add Member', subtitle: 'Register new individual', path: '/add-member', icon: <PersonAddAltRoundedIcon />, color: '#3B82F6' },
      { title: 'Verify Families', subtitle: 'Vet new families', path: '/verify-registrations?tab=0', icon: <HomeWorkIcon />, color: '#10B981' },
      { title: 'Verify Members', subtitle: 'Vet individuals', path: '/verify-registrations?tab=1', icon: <Diversity3RoundedIcon />, color: '#3B82F6' },
      { title: 'Verify Accounts', subtitle: 'Vet users', path: '/verify-registrations?tab=2', icon: <VerifiedUserIcon />, color: '#8B5CF6' },
      { title: 'Group Updates', subtitle: 'Verify change requests', path: '/verify-registrations?tab=3', icon: <HistoryIcon />, color: '#F59E0B' },
      { title: 'Submit Report', subtitle: 'Group event report', path: '/submit-report', icon: <BarChartIcon />, color: '#0EA5E9' },
      { title: 'Family Cards', subtitle: 'View group cards', path: '/familycard', icon: <Diversity3RoundedIcon />, color: '#1E3A8A' },
      { title: 'Reminders', subtitle: 'Birthdays & More', path: '/birthdays', icon: <CakeRoundedIcon />, color: '#E11D48' },
      { title: 'Family Map', subtitle: 'Geo distribution', path: '/familymap', icon: <MapRoundedIcon />, color: '#0284C7' },
      { title: 'Contact Book', subtitle: 'Anbiyam Contacts', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  } else {
    if (!hasFamily) {
      actions.push({ title: 'Submit Registration', subtitle: 'ACTION REQUIRED', path: '/add-family', icon: <VerifiedUserIcon />, color: '#BE123C' });
    }
    actions.push(
      { title: 'My Family', subtitle: 'View your profile', path: '/my-family', icon: <Diversity3RoundedIcon />, color: '#4F46E5' },
      { title: 'Contact Book', subtitle: 'Anbiyam Contacts', path: '/contacts', icon: <MapRoundedIcon />, color: '#10B981' }
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#F8FAFC">
        <CircularProgress thickness={5} size={48} sx={{ color: '#1E3A8A' }} />
      </Box>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
        {/* Hero Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            pt: 3,
            pb: 7,
            px: 3,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            boxShadow: '0 12px 32px rgba(30, 58, 138, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decoration circles */}
          <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1, mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={900} color="#fff" sx={{ letterSpacing: '-0.5px', mb: 0.3, lineHeight: 1.1 }}>
                Hello, {userName} 👋
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.75)" fontWeight={600} sx={{ lineHeight: 1.2, display: 'block' }}>
                {todayStr}
              </Typography>
              {anbiyamName && (
                <Typography variant="caption" color="rgba(255,255,255,0.6)" fontWeight={500}>
                  {anbiyamName}
                </Typography>
              )}
            </Box>
            <Chip
              label={role === 'admin' ? 'Admin' : role === 'incharge' ? 'Incharge' : 'Family'}
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#fff',
                fontWeight: 800,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '0.7rem',
                height: 26,
              }}
            />
          </Box>

          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${statsList.length <= 3 ? statsList.length : 2}, 1fr)`,
              gap: 1.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {statsList.map((stat, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(10px)',
                  p: 1.8,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.18)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box sx={{ color: 'rgba(255,255,255,0.85)' }}>{stat.icon}</Box>
                <Typography variant="h5" fontWeight={900} color="#fff" sx={{ lineHeight: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)" fontWeight={700} sx={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Registration Roadmap (family role pending) */}
        {role?.toLowerCase() === 'family' && familyStatus && familyStatus !== 'approved' && (
          <Box sx={{ px: 2, mt: -3, position: 'relative', zIndex: 2, mb: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid #F1F5F9',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="#1E293B" mb={2.5} textAlign="center">
                Registration Status
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                {[
                  { label: 'Registered', active: true, icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />, color: '#10B981' },
                  {
                    label: 'Vetted',
                    active: familyStatus === 'recommended' || familyStatus === 'approved',
                    icon: (familyStatus === 'recommended' || familyStatus === 'approved') ? <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> : <HourglassEmptyIcon sx={{ fontSize: 20 }} />,
                    color: (familyStatus === 'recommended' || familyStatus === 'approved') ? '#10B981' : '#F59E0B',
                  },
                  {
                    label: 'Approved',
                    active: familyStatus === 'approved',
                    icon: familyStatus === 'approved' ? <VerifiedIcon sx={{ fontSize: 20 }} /> : <VerifiedIcon sx={{ fontSize: 20, opacity: 0.3 }} />,
                    color: familyStatus === 'approved' ? '#10B981' : '#CBD5E1',
                  },
                ].map((step, idx) => (
                  <Box key={idx} sx={{ textAlign: 'center', flex: 1 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: `${step.color}12`,
                        color: step.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1,
                        border: step.active ? `2px solid ${step.color}` : '2px dashed #E2E8F0',
                        boxShadow: step.active ? `0 0 12px ${step.color}30` : 'none',
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color={step.active ? '#1E293B' : '#CBD5E1'}
                      sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.5px' }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Quick Services */}
        <Box sx={{ px: 2, mt: role?.toLowerCase() === 'family' && familyStatus && familyStatus !== 'approved' ? 2 : -1, position: 'relative', zIndex: 2 }}>
          <Box sx={{ mt: role?.toLowerCase() === 'family' && familyStatus && familyStatus !== 'approved' ? 0 : 4 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              fontWeight={800}
              sx={{
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1.5,
                px: 0.5,
                fontSize: '0.7rem',
              }}
            >
              Quick Services
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {actions.map((action, idx) => (
                <Card
                  key={idx}
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    border: '1px solid #F1F5F9',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:active': { transform: 'scale(0.98)', bgcolor: '#F8FAFC' },
                  }}
                >
                  <CardActionArea onClick={() => navigate(action.path)} sx={{ px: 2, py: 1.5 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            bgcolor: `${action.color}12`,
                            color: action.color,
                            width: 46,
                            height: 46,
                            borderRadius: 3,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#1E293B" sx={{ lineHeight: 1.2 }}>
                            {action.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={500}>
                            {action.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                      <ChevronRightRoundedIcon sx={{ color: '#CBD5E1', fontSize: 20 }} />
                    </Box>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Birthday/Anniversary Snackbar */}
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              borderRadius: 3,
              fontWeight: 700,
              bgcolor: '#1E3A8A',
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
