import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Tabs, Tab, Paper, ListItem, ListItemText, Avatar,
  Divider, CircularProgress, Collapse, ToggleButtonGroup, ToggleButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import API_BASE_URL from '../config';
import { getRandomGreeting } from '../utils/quotes';

const BirthdayReminders = () => {
  const [bdayData, setBdayData] = useState({ today: [], thisWeek: [], thisMonth: [], thisYear: [] });
  const [weddingData, setWeddingData] = useState({ today: [], thisWeek: [], thisMonth: [], thisYear: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState('today');
  const [reminderType, setReminderType] = useState('birthday');
  const [expandedId, setExpandedId] = useState(null);
  const [wishModalOpen, setWishModalOpen] = useState(false);
  const [currentWish, setCurrentWish] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [anbiyams, setAnbiyams] = useState([]);
  const [selectedAnbiyam, setSelectedAnbiyam] = useState('All');
  const [isAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const userAnbiyam = localStorage.getItem('anbiyam');
  const token = localStorage.getItem('token');

  const handleGenerateWish = (member) => {
    const greetingMsg = getRandomGreeting(reminderType);
    
    const headName = member.head_name || "குடும்பத்தினர்";
    
    // Translate relationship to Tamil
    const relMap = {
      "Head": "குடும்பத் தலைவர்",
      "Spouse": "துணைவர்",
      "Child": "பிள்ளை",
      "Parent": "பெற்றோர்",
      "Other": "உறவினர்"
    };
    const tamilRel = member.relationship ? relMap[member.relationship] || member.relationship : "";
    const name = member.name;

    const eventText = reminderType === 'birthday' ? 'பிறந்தநாள்' : 'திருமண நாள்';
    const icon = reminderType === 'birthday' ? '🎉' : '🎊';

    let introText = "";
    if (member.relationship === 'Head' || member.name === headName) {
      introText = `குடும்பத் தலைவர் ${name} அவர்களுக்கு`;
    } else {
      introText = `${headName} அவர்களின் ${tamilRel} ${name} அவர்களுக்கு`;
    }
      
    const fullWish = `அன்புடையீர் வணக்கம்,\n\n${member.anbiyam ? `${member.anbiyam} அன்பியம் சார்பாக, ` : ""}${introText} எங்களின் மனமார்ந்த இனிய ${eventText} நல்வாழ்த்துக்கள்! ${icon}\n\n${greetingMsg}`;
    
    setCurrentWish(fullWish);
    setCopySuccess(false);
    setWishModalOpen(true);
  };

  const handleCopyWish = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentWish)
        .then(() => setCopySuccess(true))
        .catch(err => console.error("Clipboard write failed", err));
    } else {
      // Fallback for non-HTTPS environments (like local IP access)
      const textArea = document.createElement("textarea");
      textArea.value = currentWish;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };



  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const [bdayRes, weddingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/member/birthdays`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/member/weddings`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setBdayData({
          today: bdayRes.data.today || [],
          thisWeek: bdayRes.data.thisWeek || [],
          thisMonth: bdayRes.data.thisMonth || [],
          thisYear: bdayRes.data.thisYear || [],
        });
        
        setWeddingData({
          today: weddingRes.data.today || [],
          thisWeek: weddingRes.data.thisWeek || [],
          thisMonth: weddingRes.data.thisMonth || [],
          thisYear: weddingRes.data.thisYear || [],
        });
      } catch (err) {
        setError('Failed to fetch reminders');
      } finally {
        setLoading(false);
      }
    };

    const fetchAnbiyams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/anbiyam`, { headers: { Authorization: `Bearer ${token}` } });
        setAnbiyams(res.data);
        
        // If user has a specific Anbiyam assigned and is NOT an admin, default filter to it
        if (!isAdmin && userAnbiyam) {
          setSelectedAnbiyam(userAnbiyam);
        }
      } catch (err) {
        console.error('Failed to fetch Anbiyams');
      }
    };

    fetchReminders();
    fetchAnbiyams();
  }, [token, isAdmin, userAnbiyam]);

  const currentData = reminderType === 'birthday' ? bdayData : weddingData;
  const dateField = reminderType === 'birthday' ? 'dob' : 'marriage_date';

  let filteredByTime = [];
  if (timeFilter === 'today') filteredByTime = currentData.today || [];
  else if (timeFilter === 'thisWeek') filteredByTime = currentData.thisWeek || [];
  else if (timeFilter === 'thisMonth') filteredByTime = currentData.thisMonth || [];
  else {
    // Specific month
    const monthInt = parseInt(timeFilter);
    filteredByTime = (currentData.thisYear || []).filter(m => new Date(m[dateField]).getMonth() === monthInt);
  }

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const renderList = (members) => {
    // Filter by Anbiyam
    const filteredMembers = members.filter(m => 
      selectedAnbiyam === 'All' || m.anbiyam === selectedAnbiyam
    );

    const sortedMembers = timeFilter !== 'today'
      ? [...filteredMembers].sort((a, b) => {
          const dateA = new Date(a[dateField]);
          const dateB = new Date(b[dateField]);
          if (dateA.getMonth() !== dateB.getMonth()) {
            return dateA.getMonth() - dateB.getMonth();
          }
          return dateA.getDate() - dateB.getDate();
        })
      : filteredMembers;

    return (
      <Box sx={{ mt: 2 }}>
        {sortedMembers.length === 0 && (
          <Box 
            p={4} 
            textAlign="center" 
            sx={{ 
              bgcolor: 'transparent', 
              border: '2px dashed #E2E8F0', 
              borderRadius: 4,
              mt: 2
            }}
          >
            <Avatar sx={{ width: 64, height: 64, bgcolor: '#F1F5F9', color: '#94A3B8', mx: 'auto', mb: 2 }}>
              {reminderType === 'birthday' ? '🎂' : '💍'}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={800} color="#475569">
              No {reminderType === 'birthday' ? 'Birthdays' : 'Anniversaries'} Found
            </Typography>
            <Typography variant="body2" color="#94A3B8" mt={0.5}>
              There are no records for the selected period.
            </Typography>
          </Box>
        )}
        {sortedMembers.map((m, index) => (
          <Paper 
            key={m.member_id} 
            elevation={0}
            sx={{ 
              mb: 1.5, 
              border: '1px solid #E2E8F0', 
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#3B82F6', bgcolor: '#F8FAFC' }
            }}
          >
            <ListItem 
              button 
              onClick={() => toggleExpand(m.member_id)}
              sx={{ p: 2 }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: reminderType === 'birthday' ? '#FEE2E2' : '#E0E7FF',
                  color: reminderType === 'birthday' ? '#EF4444' : '#4F46E5',
                  mr: 2,
                  width: 48,
                  height: 48
                }}
              >
                {reminderType === 'birthday' ? '🎂' : '💍'}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    {m.name}
                  </Typography>
                }
                secondary={
                  <Box mt={0.5}>
                    <Typography component="span" variant="body2" color="#64748B" fontWeight={600}>
                      {new Date(m[dateField]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {!['today', 'thisWeek', 'thisMonth'].includes(timeFilter) && ` (${new Date(m[dateField]).getFullYear()})`}
                    </Typography>
                    <Typography component="span" variant="caption" sx={{ display: 'block', mt: 0.5, color: '#94A3B8' }}>
                      {m.anbiyam ? `${m.anbiyam} Anbiyam` : 'N/A'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            <Collapse in={expandedId === m.member_id} timeout="auto" unmountOnExit>
              <Divider />
              <Box px={3} py={2} bgcolor="#F8FAFC">
                <Typography variant="body2" color="textSecondary" mb={0.5}>
                  <strong>Family Head:</strong> {m.head_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={0.5}>
                  <strong>Relationship:</strong> {m.relationship || 'N/A'}
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={1.5}>
                  <strong>Mobile:</strong> {m.mobile || 'N/A'}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  fullWidth
                  sx={{ 
                    bgcolor: '#1E3A8A', 
                    borderRadius: 2, 
                    fontWeight: 700,
                    textTransform: 'none',
                    py: 1
                  }}
                  onClick={() => handleGenerateWish(m)}
                >
                  Generate WhatsApp Wish
                </Button>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Box>
    );
  };

  if (loading) return <Box textAlign="center" py={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Box p={{ xs: 2, md: 3 }} pb={10}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        gap={1.5}
        mb={1}
      >
        <Typography variant="h5" fontWeight={800} color="#1E3A8A">
          Reminders
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={reminderType}
          exclusive
          onChange={(e, newType) => { if (newType) setReminderType(newType); setExpandedId(null); }}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' }, '& .MuiToggleButton-root': { flex: 1, fontWeight: 700 } }}
        >
          <ToggleButton value="birthday">Birthdays</ToggleButton>
          <ToggleButton value="wedding">Anniversaries</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography variant="subtitle2" color="textSecondary" mb={3} fontWeight={600}>
        Today is <Box component="span" color="primary.main">{todayStr}</Box>
      </Typography>

      <Box 
        mb={3} 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        gap={1.5} 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 3, border: '1px solid #E2E8F0' }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
          <InputLabel>Filter by Anbiyam</InputLabel>
          <Select
            value={selectedAnbiyam}
            label="Filter by Anbiyam"
            onChange={(e) => setSelectedAnbiyam(e.target.value)}
            disabled={!isAdmin && !!userAnbiyam}
            sx={{ bgcolor: '#fff' }}
          >
            <MenuItem value="All">All Anbiyams</MenuItem>
            {anbiyams.map((anb) => (
              <MenuItem key={anb.id} value={anb.name}>
                {anb.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!isAdmin && userAnbiyam && (
          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 800, bgcolor: '#ECFDF5', px: 1.5, py: 0.5, borderRadius: 2 }}>
            Locked to {userAnbiyam}
          </Typography>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
            Timeline
          </Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={timeFilter}
              onChange={(e) => { setTimeFilter(e.target.value); setExpandedId(null); }}
              sx={{ bgcolor: '#F8FAFC', fontWeight: 700, borderRadius: 2 }}
            >
              <MenuItem value="today">Today ({currentData.today?.length || 0})</MenuItem>
              <MenuItem value="thisWeek">This Week ({currentData.thisWeek?.length || 0})</MenuItem>
              <MenuItem value="thisMonth">This Month ({currentData.thisMonth?.length || 0})</MenuItem>
              <Divider />
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                <MenuItem key={index} value={index.toString()}>
                  {month} ({(currentData.thisYear || []).filter(m => new Date(m[dateField]).getMonth() === index).length})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box>{renderList(filteredByTime)}</Box>
      </Paper>

      <Dialog open={wishModalOpen} onClose={() => setWishModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E3A8A' }}>Generated Wish</DialogTitle>
        <DialogContent dividers>
          <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
              {currentWish}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWishModalOpen(false)} color="inherit">Close</Button>
          <Button onClick={handleCopyWish} variant="contained" color={copySuccess ? "success" : "primary"}>
            {copySuccess ? "Copied!" : "Copy Text"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BirthdayReminders;
