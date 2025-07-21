import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import API_BASE_URL from '../config';

const BirthdayReminders = () => {
  const [data, setData] = useState({ today: [], thisWeek: [], thisMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/member/birthdays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch birthday reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [token]);

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
            secondary={`DOB: ${new Date(m.dob).toLocaleDateString('en-GB')} | Anbiyam: ${m.tat || 'N/A'}`}
          />
        </ListItem>
      ))}
    </List>
  );

  if (loading) {
    return <Box textAlign="center" py={4}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const tabLabels = ['Today', 'This Week', 'This Month'];
  const tabData = [data.today, data.thisWeek, data.thisMonth];

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">🎂 Birthday Reminders</Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} indicatorColor="primary" textColor="primary" centered>
          {tabLabels.map((label, index) => (
            <Tab label={label} key={index} />
          ))}
        </Tabs>

        <Divider sx={{ my: 2 }} />
        {renderList(tabData[tab])}
      </Paper>
    </Box>
  );
};

export default BirthdayReminders;
