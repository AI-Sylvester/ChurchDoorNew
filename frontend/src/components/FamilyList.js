import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Avatar, Stack, Fade, IconButton, 
  Card, Chip, InputAdornment, Tabs, Tab, TextField, CardActionArea
} from '@mui/material';
import API_BASE_URL from '../config';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

const ChevronRightRoundedIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();

  const fetchFamilies = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = tab === 0 ? 'list' : 'list-inactive';
      const response = await axios.get(`${API_BASE_URL}/family/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFamilies(response.data.families || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const filteredFamilies = useMemo(() => {
    return families.filter(fam => 
      fam.head_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      fam.family_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [families, searchQuery]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress thickness={5} size={50} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 12, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px', mb: 1 }}>
          Church Directory
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>
          Browse and manage parish families
        </Typography>
      </Box>

      {(role === 'admin' || role === 'incharge') && (
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ 
            mb: 4, 
            bgcolor: '#fff', 
            borderRadius: 4, 
            p: 0.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            '& .MuiTabs-indicator': { height: '100%', borderRadius: 3, bgcolor: '#4F46E508', zIndex: 0 },
            '& .MuiTab-root': { zIndex: 1, fontWeight: 900, textTransform: 'none', minHeight: 48 }
          }}
        >
          <Tab label="Active Members" />
          <Tab label="Pending Vetting" />
        </Tabs>
      )}

      <TextField
        fullWidth
        placeholder="Search by name, ID or Anbiyam..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ 
          mb: 4, 
          bgcolor: '#fff', 
          '& .MuiOutlinedInput-root': { 
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
            border: '1px solid #E2E8F0'
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 2.5 }}>
        {filteredFamilies.map((fam, idx) => (
          <Fade key={fam.family_id} in timeout={400 + (idx * 50)}>
            <Card 
              sx={{ 
                flex: { xs: '1 1 100%', md: '0 1 calc(50% - 20px)', lg: '0 1 calc(33.333% - 20px)' },
                borderRadius: 6, 
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': { transform: 'scale(0.98)' }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                 <Box sx={{ 
                   height: 80, 
                   background: 'linear-gradient(45deg, #1E3A8A 0%, #3B82F6 100%)',
                   opacity: 0.1
                 }} />
                 <Avatar
                   variant="rounded"
                   src={fam.family_pic}
                   sx={{ 
                     width: 80, height: 80, 
                     position: 'absolute', top: 40, left: 24,
                     borderRadius: 4, border: '4px solid #fff',
                     boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                     bgcolor: '#fff', color: '#1E3A8A', fontWeight: 900, fontSize: '1.5rem'
                   }}
                 >
                   {!fam.family_pic && (fam.head_name || 'F').charAt(0)}
                 </Avatar>
                 
                 {(role === 'admin' || role === 'incharge') && (
                   <IconButton 
                     onClick={(e) => { e.stopPropagation(); navigate(`/edit-family/${fam.family_id}`); }}
                     sx={{ 
                       position: 'absolute', top: 12, right: 12, 
                       bgcolor: 'rgba(255,255,255,0.8)', 
                       backdropFilter: 'blur(10px)',
                       '&:hover': { bgcolor: '#fff' }
                     }}
                     size="small"
                   >
                     <EditIcon fontSize="small" />
                   </IconButton>
                 )}
              </Box>

              <CardActionArea onClick={() => navigate(`/familydet/${fam.family_id}`)} sx={{ pt: 6, px: 3, pb: 3 }}>
                 <Box mb={2}>
                   <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.5px', mb: 0.5 }}>
                     {fam.head_name}
                   </Typography>
                   <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={fam.family_id} 
                        size="small" 
                        sx={{ height: 20, borderRadius: 1.5, fontWeight: 900, fontSize: '0.65rem', bgcolor: '#F1F5F9' }} 
                      />
                      <Box sx={{ 
                        px: 1, py: 0.3, borderRadius: 1.5, 
                        bgcolor: fam.active ? '#ECFDF5' : '#FFF7ED',
                        color: fam.active ? '#10B981' : '#F59E0B',
                        fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase'
                      }}>
                        {fam.active ? 'Approved' : 'Pending'}
                      </Box>
                   </Stack>
                 </Box>

                 <Stack spacing={1.5}>
                   <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#EFF6FF', color: '#3B82F6', borderRadius: 2 }}>
                        <LocationOnRoundedIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ display: 'block', lineHeight: 1 }}>Location</Typography>
                        <Typography variant="body2" fontWeight={700} color="#475569" noWrap sx={{ maxWidth: 180 }}>
                          {fam.anbiyam} • {fam.city}
                        </Typography>
                      </Box>
                   </Box>
                   <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#F5F3FF', color: '#8B5CF6', borderRadius: 2 }}>
                        <PhoneRoundedIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ display: 'block', lineHeight: 1 }}>Contact</Typography>
                        <Typography variant="body2" fontWeight={700} color="#475569">
                          {fam.mobile_number}
                        </Typography>
                      </Box>
                   </Box>
                 </Stack>
                 
                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <ChevronRightRoundedIcon sx={{ color: '#CBD5E1' }} />
                 </Box>
              </CardActionArea>
            </Card>
          </Fade>
        ))}
      </Box>

      {filteredFamilies.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary" fontWeight={600}>No families found matching your criteria.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default FamilyList;
