import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Avatar, Divider, CircularProgress,
  Collapse, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Chip, Stack,
  useTheme, useMediaQuery, IconButton
} from '@mui/material';
import API_BASE_URL from '../config';
import { getRandomGreeting } from '../utils/quotes';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGenerateWish = (member) => {
    const greetingMsg = getRandomGreeting(reminderType);
    const headName = member.head_name || "குடும்பத்தினர்";
    const relMap = {
      "Head": "குடும்பத் தலைவர்", "Spouse": "துணைவர்", "Child": "பிள்ளை",
      "Parent": "பெற்றோர்", "Other": "உறவினர்"
    };
    const tamilRel = member.relationship ? relMap[member.relationship] || member.relationship : "";
    const name = member.name;
    const eventText = reminderType === 'birthday' ? 'பிறந்தநாள்' : 'திருமண நாள்';
    const icon = reminderType === 'birthday' ? '🎉' : '🎊';
    let introText = member.relationship === 'Head' || member.name === headName
      ? `குடும்பத் தலைவர் ${name} அவர்களுக்கு`
      : `${headName} அவர்களின் ${tamilRel} ${name} அவர்களுக்கு`;
    const fullWish = `அன்புடையீர் வணக்கம்,\n\n${member.anbiyam ? `${member.anbiyam} அன்பியம் சார்பாக, ` : ""}${introText} எங்களின் மனமார்ந்த இனிய ${eventText} நல்வாழ்த்துக்கள்! ${icon}\n\n${greetingMsg}`;
    setCurrentWish(fullWish);
    setCopySuccess(false);
    setWishModalOpen(true);
  };

  const handleCopyWish = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(currentWish).then(() => setCopySuccess(true)).catch(console.error);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = currentWish;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); setCopySuccess(true); } catch (err) {}
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bdayRes, weddingRes, anbRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/member/birthdays`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/member/weddings`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/anbiyam`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBdayData({ today: bdayRes.data.today || [], thisWeek: bdayRes.data.thisWeek || [], thisMonth: bdayRes.data.thisMonth || [], thisYear: bdayRes.data.thisYear || [] });
        setWeddingData({ today: weddingRes.data.today || [], thisWeek: weddingRes.data.thisWeek || [], thisMonth: weddingRes.data.thisMonth || [], thisYear: weddingRes.data.thisYear || [] });
        setAnbiyams(anbRes.data);
        if (!isAdmin && userAnbiyam) setSelectedAnbiyam(userAnbiyam);
      } catch (err) {
        setError('Failed to fetch reminders');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token, isAdmin, userAnbiyam]);

  const currentData = reminderType === 'birthday' ? bdayData : weddingData;
  const dateField = reminderType === 'birthday' ? 'dob' : 'marriage_date';

  let filteredByTime = [];
  if (timeFilter === 'today') filteredByTime = currentData.today || [];
  else if (timeFilter === 'thisWeek') filteredByTime = currentData.thisWeek || [];
  else if (timeFilter === 'thisMonth') filteredByTime = currentData.thisMonth || [];
  else {
    const monthInt = parseInt(timeFilter);
    filteredByTime = (currentData.thisYear || []).filter(m => new Date(m[dateField]).getMonth() === monthInt);
  }

  const filteredMembers = filteredByTime.filter(m => selectedAnbiyam === 'All' || m.anbiyam === selectedAnbiyam);
  const sortedMembers = timeFilter !== 'today'
    ? [...filteredMembers].sort((a, b) => {
        const da = new Date(a[dateField]), db = new Date(b[dateField]);
        return da.getMonth() !== db.getMonth() ? da.getMonth() - db.getMonth() : da.getDate() - db.getDate();
      })
    : filteredMembers;

  const isBirthday = reminderType === 'birthday';

  if (loading) return (
    <Box display="flex" justifyContent="center" pt={8}>
      <CircularProgress size={40} sx={{ color: '#1E3A8A' }} />
    </Box>
  );
  if (error) return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;

  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <Box sx={{ pb: 12, pt: 2.5, px: 2.5 }}>
      {/* Header */}
      <Box mb={2.5}>
        <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.3px', mb: 0.3 }}>
          Reminders
        </Typography>
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          Today is <Box component="span" color="primary.main" fontWeight={800}>{todayStr}</Box>
        </Typography>
      </Box>

      {/* Type toggle — pill style */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: '#F1F5F9',
          borderRadius: 3,
          p: 0.5,
          mb: 2.5,
        }}
      >
        {['birthday', 'wedding'].map((type) => (
          <Box
            key={type}
            onClick={() => { setReminderType(type); setExpandedId(null); }}
            sx={{
              flex: 1,
              py: 1.2,
              borderRadius: 2.5,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: reminderType === type ? '#fff' : 'transparent',
              boxShadow: reminderType === type ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
            }}
          >
            {type === 'birthday'
              ? <CakeRoundedIcon sx={{ fontSize: 16, color: reminderType === type ? '#E11D48' : '#94A3B8' }} />
              : <FavoriteRoundedIcon sx={{ fontSize: 16, color: reminderType === type ? '#7C3AED' : '#94A3B8' }} />}
            <Typography
              variant="caption"
              fontWeight={800}
              color={reminderType === type ? '#1E293B' : '#94A3B8'}
              sx={{ fontSize: '0.8rem' }}
            >
              {type === 'birthday' ? 'Birthdays' : 'Anniversaries'}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Timeline</InputLabel>
          <Select
            value={timeFilter}
            label="Timeline"
            onChange={(e) => { setTimeFilter(e.target.value); setExpandedId(null); }}
            sx={{ borderRadius: 2.5, bgcolor: '#fff', fontWeight: 700 }}
          >
            <MenuItem value="today">Today ({currentData.today?.length || 0})</MenuItem>
            <MenuItem value="thisWeek">This Week ({currentData.thisWeek?.length || 0})</MenuItem>
            <MenuItem value="thisMonth">This Month ({currentData.thisMonth?.length || 0})</MenuItem>
            <Divider />
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((month, index) => (
              <MenuItem key={index} value={index.toString()}>
                {month} ({(currentData.thisYear || []).filter(m => new Date(m[dateField]).getMonth() === index).length})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Anbiyam</InputLabel>
          <Select
            value={selectedAnbiyam}
            label="Anbiyam"
            onChange={(e) => setSelectedAnbiyam(e.target.value)}
            disabled={!isAdmin && !!userAnbiyam}
            sx={{ borderRadius: 2.5, bgcolor: '#fff', fontWeight: 700 }}
          >
            <MenuItem value="All">All Anbiyams</MenuItem>
            {anbiyams.map((anb) => (
              <MenuItem key={anb.id} value={anb.name}>{anb.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Count badge */}
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <Chip
          label={`${sortedMembers.length} ${isBirthday ? 'Birthdays' : 'Anniversaries'}`}
          size="small"
          sx={{
            bgcolor: isBirthday ? '#FFF1F2' : '#F5F3FF',
            color: isBirthday ? '#E11D48' : '#7C3AED',
            fontWeight: 800,
            fontSize: '0.72rem',
          }}
        />
      </Box>

      {/* List */}
      {sortedMembers.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed #E2E8F0',
            borderRadius: 4,
          }}
        >
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: '#F8FAFC', mx: 'auto', mb: 2, fontSize: '2rem', borderRadius: 3 }}
          >
            {isBirthday ? '🎂' : '💍'}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={700} color="textSecondary">
            No {isBirthday ? 'Birthdays' : 'Anniversaries'} Found
          </Typography>
          <Typography variant="caption" color="#94A3B8" display="block" mt={0.5}>
            None in the selected period.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: '#fff', borderRadius: 4, overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          {sortedMembers.map((m, idx) => (
            <Box key={m.member_id}>
              {/* Row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.5,
                  gap: 2,
                  cursor: 'pointer',
                  '&:active': { bgcolor: '#F8FAFC' },
                  '&:hover': { bgcolor: '#FAFBFC' },
                }}
                onClick={() => setExpandedId(expandedId === m.member_id ? null : m.member_id)}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: isBirthday ? '#FFF1F2' : '#F5F3FF',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}
                >
                  {isBirthday ? '🎂' : '💍'}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle2" fontWeight={800} color="#1E293B" noWrap>
                    {m.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={600}>
                    {new Date(m[dateField]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    {!['today', 'thisWeek', 'thisMonth'].includes(timeFilter) && ` (${new Date(m[dateField]).getFullYear()})`}
                    {m.anbiyam && ` • ${m.anbiyam}`}
                  </Typography>
                </Box>
                {expandedId === m.member_id
                  ? <ExpandLessRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  : <ExpandMoreRoundedIcon sx={{ color: '#CBD5E1', fontSize: 20 }} />}
              </Box>

              {/* Expanded detail */}
              <Collapse in={expandedId === m.member_id}>
                <Box
                  sx={{
                    px: 2,
                    pb: 2,
                    ml: 9,
                    bgcolor: '#FAFBFC',
                    borderTop: '1px solid #F1F5F9',
                    pt: 1.5,
                  }}
                >
                  <Stack spacing={0.8} sx={{ mb: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ minWidth: 80, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Family Head
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#334155">{m.head_name || '—'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ minWidth: 80, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Relation
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#334155">{m.relationship || '—'}</Typography>
                    </Box>
                    {m.mobile && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneRoundedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                        <Typography variant="caption" fontWeight={700} color="#334155">{m.mobile}</Typography>
                      </Box>
                    )}
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleGenerateWish(m)}
                    sx={{
                      bgcolor: '#1E3A8A',
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: 'none',
                      py: 1,
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#172554' },
                    }}
                  >
                    Generate WhatsApp Wish
                  </Button>
                </Box>
              </Collapse>

              {idx < sortedMembers.length - 1 && <Divider sx={{ ml: 9, opacity: 0.5 }} />}
            </Box>
          ))}
        </Box>
      )}

      {/* Wish Dialog */}
      <Dialog
        open={wishModalOpen}
        onClose={() => setWishModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 5, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 900,
            fontSize: '1rem',
            borderBottom: '1px solid #F1F5F9',
            p: 2.5,
          }}
        >
          Generated Wish
          <IconButton onClick={() => setWishModalOpen(false)} size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B' }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#334155', fontWeight: 500 }}>
              {currentWish}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: '1px solid #F1F5F9' }}>
          <Button
            onClick={() => setWishModalOpen(false)}
            sx={{ fontWeight: 700, color: '#64748B', borderRadius: 3 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleCopyWish}
            startIcon={copySuccess ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
            color={copySuccess ? 'success' : 'primary'}
            sx={{ borderRadius: 3, fontWeight: 800, textTransform: 'none', flex: 1 }}
          >
            {copySuccess ? 'Copied!' : 'Copy Text'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BirthdayReminders;
