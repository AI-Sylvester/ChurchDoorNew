import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Collapse,
} from '@mui/material';
import API_BASE_URL from '../config';

const BirthdayReminders = () => {
  const [data, setData] = useState({ today: [], thisWeek: [], thisMonth: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const token = localStorage.getItem('token');

  const tabLabels = [
    { label: 'Today', key: 'today' },
    { label: 'Week', key: 'thisWeek' },
      { label: 'Month', key: 'thisMonth' }, // NEW TAB
    
  ];

  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/member/birthdays`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData({
          today: res.data.today || [],
          thisWeek: res.data.thisWeek || [],
           thisMonth: res.data.thisMonth || [], // ADD THIS
        });
      } catch (err) {
        setError('Failed to fetch birthday reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [token]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

const renderList = (members) => {
  // If current tab is "thisWeek", sort by DOB ascending
const sortedMembers = ['thisWeek', 'thisMonth'].includes(tabLabels[tabIndex].key)
  ? [...members].sort((a, b) => new Date(b.dob) - new Date(a.dob))
  : members;
  return (
    <List dense>
      {sortedMembers.length === 0 && (
        <ListItem>
          <ListItemText primary="No birthdays" />
        </ListItem>
      )}
      {sortedMembers.map((m, index) => (
        <React.Fragment key={m.member_id}>
          <ListItem button onClick={() => toggleExpand(m.member_id)}>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  {m.name}
                </Typography>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    DOB: {new Date(m.dob).toLocaleDateString('en-GB')}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2">
                    Anbiyam: {m.anbiyam || 'N/A'}
                  </Typography>
                </>
              }
            />
          </ListItem>
          <Collapse in={expandedId === m.member_id} timeout="auto" unmountOnExit>
            <Box px={4} pb={2}>
              <Typography variant="body2">Member ID: {m.member_id}</Typography>
              <Typography variant="body2">Mobile: {m.mobile || 'N/A'}</Typography>
              <Typography variant="body2">Family Head: {m.head_name || 'N/A'}</Typography>
            </Box>
          </Collapse>
          {index < sortedMembers.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const currentKey = tabLabels[tabIndex].key;
  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} color="primary" mb={1}>
        Birthday Reminders
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={2}>
        Today is <strong>{todayStr}</strong>
      </Typography>

      <Paper elevation={3} sx={{ p: 1, mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          {tabLabels.map((tab) => (
            <Tab
              key={tab.key}
              label={`${tab.label} (${data[tab.key]?.length || 0})`}
            />
          ))}
        </Tabs>

        <Divider sx={{ mb: 1 }} />

        <Box sx={{ p: 2 }}>{renderList(data[currentKey])}</Box>
      </Paper>
    </Box>
  );
};

export default BirthdayReminders;
