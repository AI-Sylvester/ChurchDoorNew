import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  Avatar,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonIcon from '@mui/icons-material/Person';
import ElderlyIcon from '@mui/icons-material/Elderly';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import API_BASE_URL from '../config';

const StatsPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState({ title: '', members: [] });
  const [openDialog, setOpenDialog] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/member/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 } // Fetch all for stats
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Categories
  const kids = members.filter(m => parseInt(m.age) < 16);
  const youth = members.filter(m => {
    const age = parseInt(m.age);
    return age >= 16 && age <= 28 && (m.marital_status || '').toLowerCase() === 'single';
  });
  const seniors = members.filter(m => parseInt(m.age) >= 55);
  
  // Married Couples (Grouped by family)
  const familyGroups = members.reduce((acc, m) => {
    if (!acc[m.family_id]) acc[m.family_id] = [];
    acc[m.family_id].push(m);
    return acc;
  }, {});

  const couples = [];
  Object.values(familyGroups).forEach(famMembers => {
    const marriedInFamily = famMembers.filter(m => (m.marital_status || '').toLowerCase() === 'married');
    if (marriedInFamily.length >= 2) {
      // Create pairs
      for (let i = 0; i < marriedInFamily.length; i += 2) {
        if (marriedInFamily[i+1]) {
          couples.push({
            partner1: marriedInFamily[i],
            partner2: marriedInFamily[i+1],
            family_id: marriedInFamily[i].family_id
          });
        }
      }
    }
  });

  const stats = [
    { 
      title: 'Kids (< 16)', 
      count: kids.length, 
      icon: <ChildCareIcon />, 
      color: '#0EA5E9', 
      list: kids 
    },
    { 
      title: 'Youth (16-28 Single)', 
      count: youth.length, 
      icon: <PersonIcon />, 
      color: '#8B5CF6', 
      list: youth 
    },
    { 
      title: 'Seniors (55+)', 
      count: seniors.length, 
      icon: <ElderlyIcon />, 
      color: '#F59E0B', 
      list: seniors 
    },
    { 
      title: 'Married Couples', 
      count: couples.length, 
      icon: <FavoriteIcon />, 
      color: '#EC4899', 
      list: couples,
      isCouples: true
    },
  ];

  const handleOpenList = (stat) => {
    setSelectedList({ title: stat.title, members: stat.list, isCouples: stat.isCouples });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight={800} color="#1E3A8A" mb={3}>
        Member Statistics
      </Typography>

      <Stack spacing={2}>
        {stats.map((stat, index) => (
          <Card 
            key={index}
            sx={{ 
              borderRadius: 4, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              }
            }}
          >
            <CardActionArea 
              onClick={() => handleOpenList(stat)}
              sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: `${stat.color}10`, 
                    color: stat.color,
                    mr: 2.5,
                    borderRadius: 4,
                    fontSize: '1.8rem'
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#1E293B" lineHeight={1}>
                    {stat.count}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="textSecondary" mt={0.5}>
                    {stat.title}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="button" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.75rem', display: { xs: 'none', sm: 'block' } }}>
                  View List
                </Typography>
                <ChevronRightIcon sx={{ color: '#94A3B8' }} />
              </Box>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1E3A8A' }}>
          {selectedList.title}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {selectedList.isCouples ? (
              selectedList.members.map((couple, idx) => (
                <React.Fragment key={idx}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText 
                      primary={
                        <Typography fontWeight={700} color="#1E293B">
                          {couple.partner1.name} & {couple.partner2.name}
                        </Typography>
                      }
                      secondary={`Family ID: ${couple.family_id}`}
                    />
                  </ListItem>
                  {idx < selectedList.members.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              selectedList.members.map((m, idx) => (
                <React.Fragment key={idx}>
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText 
                      primary={<Typography fontWeight={700}>{m.name}</Typography>}
                      secondary={`ID: ${m.member_id} | Age: ${m.age} | ${m.profession || 'N/A'}`}
                    />
                  </ListItem>
                  {idx < selectedList.members.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
            {selectedList.members.length === 0 && (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No records found in this category.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} variant="contained" fullWidth sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatsPage;
