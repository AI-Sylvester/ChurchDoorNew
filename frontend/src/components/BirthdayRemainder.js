import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import API_BASE_URL from '../config';

const BirthdayReminders = () => {
  const [data, setData] = useState({ today: [], thisWeek: [], thisMonth: [] });
  const [anbiyams, setAnbiyams] = useState({});
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bdayRes, anbiyamRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/member/birthdays`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/anbiyams`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setData(bdayRes.data);
        const anbiyamMap = {};
        anbiyamRes.data.forEach((a) => {
          anbiyamMap[a.code] = a.name;
        });
        setAnbiyams(anbiyamMap);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch birthday reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const handleTabChange = (event, newValue) => setTab(newValue);

  const getCurrentList = () => {
    if (tab === 0) return data.today;
    if (tab === 1) return data.thisWeek;
    return data.thisMonth;
  };

  const renderList = (members) => (
    <List dense>
      {members.length === 0 && (
        <ListItem>
          <ListItemText primary="No birthdays" />
        </ListItem>
      )}
      {members.map((m) => (
        <ListItem key={m.member_id}>
          <ListItemText
            primary={`${m.name} (${m.member_id})`}
            secondary={`DOB: ${new Date(m.dob).toLocaleDateString('en-GB')} | Anbiyam: ${anbiyams[m.anbiyam_code] || 'N/A'}`}
          />
        </ListItem>
      ))}
    </List>
  );

  if (loading) return <Box textAlign="center" py={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">
        🎂 Birthday Reminders
      </Typography>

      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary">
          <Tab label={`Today (${data.today.length})`} />
          <Tab label={`This Week (${data.thisWeek.length})`} />
          <Tab label={`This Month (${data.thisMonth.length})`} />
        </Tabs>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>
          {tab === 0 ? 'Today' : tab === 1 ? 'This Week' : 'This Month'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderList(getCurrentList())}
      </Paper>
    </Box>
  );
};

export default BirthdayReminders;
