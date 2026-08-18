import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardActionArea, Avatar, Stack, CircularProgress,
  List, ListItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Chip, useTheme, useMediaQuery, IconButton
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonIcon from '@mui/icons-material/Person';
import ElderlyIcon from '@mui/icons-material/Elderly';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import API_BASE_URL from '../config';

const StatsPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState({ title: '', members: [], isCouples: false });
  const [openDialog, setOpenDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/member/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 }
        });
        setMembers(res.data.members || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllMembers();
  }, [token]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
      <CircularProgress size={40} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  const babies = members.filter(m => { const a = parseInt(m.age); return a >= 1 && a <= 5; });
  const kids = members.filter(m => { const a = parseInt(m.age); return a > 5 && a <= 16; });
  const youth = members.filter(m => { const a = parseInt(m.age); return a > 16 && a <= 28 && (m.marital_status || '').toLowerCase() === 'single'; });
  const seniors = members.filter(m => parseInt(m.age) >= 55);

  const familyGroups = members.reduce((acc, m) => {
    if (!acc[m.family_id]) acc[m.family_id] = [];
    acc[m.family_id].push(m);
    return acc;
  }, {});

  const couples = [];
  Object.values(familyGroups).forEach(famMembers => {
    const married = famMembers.filter(m => (m.marital_status || '').toLowerCase() === 'married');
    if (married.length >= 2) {
      for (let i = 0; i < married.length; i += 2) {
        if (married[i + 1]) {
          couples.push({ partner1: married[i], partner2: married[i + 1], family_id: married[i].family_id });
        }
      }
    }
  });

  const stats = [
    { title: 'Babies', subtitle: 'Age 1–5', count: babies.length, icon: <ChildCareIcon />, color: '#10B981', list: babies },
    { title: 'Children', subtitle: 'Age 6–16', count: kids.length, icon: <ChildCareIcon />, color: '#0EA5E9', list: kids },
    { title: 'Youth', subtitle: 'Age 17–28, Single', count: youth.length, icon: <PersonIcon />, color: '#8B5CF6', list: youth },
    { title: 'Seniors', subtitle: 'Age 55+', count: seniors.length, icon: <ElderlyIcon />, color: '#F59E0B', list: seniors },
    { title: 'Married Couples', subtitle: 'By family unit', count: couples.length, icon: <FavoriteIcon />, color: '#EC4899', list: couples, isCouples: true },
  ];

  const handleOpenList = (stat) => {
    setSelectedList({ title: stat.title, members: stat.list, isCouples: stat.isCouples });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ pb: 12, pt: 2.5, px: 2.5 }}>
      {/* Header */}
      <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ mb: 0.5, letterSpacing: '-0.3px' }}>
        Statistics
      </Typography>
      <Typography variant="caption" color="textSecondary" fontWeight={600} display="block" mb={3}>
        {members.length} total members across {Object.keys(familyGroups).length} families
      </Typography>

      <Stack spacing={1.5}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: 4,
              border: '1px solid #F1F5F9',
              transition: 'all 0.2s ease',
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            <CardActionArea
              onClick={() => handleOpenList(stat)}
              sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: `${stat.color}12`,
                    color: stat.color,
                    borderRadius: 3.5,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={900} color="#1E293B" lineHeight={1} mb={0.3}>
                    {stat.count}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
                    {stat.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" fontWeight={500}>
                    {stat.subtitle}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="caption"
                  sx={{
                    color: stat.color,
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  View List
                </Typography>
                <ChevronRightRoundedIcon sx={{ color: '#CBD5E1', fontSize: 20 }} />
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      {/* Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        scroll="paper"
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 5 } }}
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
          <Box>
            <Typography fontWeight={900}>{selectedList.title}</Typography>
            <Chip
              label={`${selectedList.members.length} records`}
              size="small"
              sx={{ mt: 0.5, fontWeight: 700, bgcolor: '#F1F5F9', color: '#64748B', fontSize: '0.65rem' }}
            />
          </Box>
          <IconButton onClick={() => setOpenDialog(false)} size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B' }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedList.members.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography color="textSecondary" variant="body2" fontWeight={600}>
                No records found.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ bgcolor: '#fff' }}>
              <List disablePadding>
                {selectedList.isCouples ? (
                  selectedList.members.map((couple, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem sx={{ py: 1.8, px: 2.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            bgcolor: '#FFF1F2',
                            color: '#EC4899',
                            fontWeight: 800,
                            mr: 2,
                            fontSize: '1rem',
                          }}
                        >
                          💑
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                            {couple.partner1.name} & {couple.partner2.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            Family ID: {couple.family_id}
                          </Typography>
                        </Box>
                      </ListItem>
                      {idx < selectedList.members.length - 1 && <Divider sx={{ ml: 10 }} />}
                    </React.Fragment>
                  ))
                ) : (
                  selectedList.members.map((m, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem sx={{ py: 1.5, px: 2.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 3,
                            bgcolor: m.sex === 'Male' ? '#EFF6FF' : '#FFF1F2',
                            color: m.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                            fontWeight: 800,
                            fontSize: '1rem',
                            mr: 2,
                          }}
                        >
                          {(m.name || '?').charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                            {m.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            {m.age} Yrs • {m.profession || 'N/A'}
                          </Typography>
                        </Box>
                      </ListItem>
                      {idx < selectedList.members.length - 1 && <Divider sx={{ ml: 11 }} />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #F1F5F9' }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            fullWidth
            sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, bgcolor: '#1E293B', '&:hover': { bgcolor: '#0F172A' } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatsPage;
