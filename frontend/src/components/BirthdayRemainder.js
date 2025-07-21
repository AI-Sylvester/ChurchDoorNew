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
} from '@mui/material';
import API_BASE_URL from '../config';

const BirthdayReminders = () => {
  const [data, setData] = useState({ today: [], thisWeek: [], thisMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      <ListItem key={m.member_id} alignItems="flex-start">
        <ListItemText
          primary={`${m.name} (${m.member_id})`}
          secondary={
            <>
              <Typography component="span" variant="body2">
                DOB: {new Date(m.dob).toLocaleDateString('en-GB')}
              </Typography>
              <br />
              <Typography component="span" variant="body2">
                Mobile: {m.mobile || 'N/A'}
              </Typography>
              <br />
              <Typography component="span" variant="body2">
                Family Head: {m.head_name || 'N/A'}
              </Typography>
              <br />
              <Typography component="span" variant="body2">
                Anbiyam: {m.anbiyam || 'N/A'}
              </Typography>
            </>
          }
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

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={2} color="primary">🎂 Birthday Reminders</Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Today</Typography>
        <Divider sx={{ my: 1 }} />
        {renderList(data.today)}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">This Week</Typography>
        <Divider sx={{ my: 1 }} />
        {renderList(data.thisWeek)}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">This Month</Typography>
        <Divider sx={{ my: 1 }} />
        {renderList(data.thisMonth)}
      </Paper>
    </Box>
  );
};

export default BirthdayReminders;
