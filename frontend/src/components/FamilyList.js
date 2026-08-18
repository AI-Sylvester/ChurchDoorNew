import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Avatar, Fade, IconButton,
  Chip, InputAdornment, Tabs, Tab, TextField, Divider, Stack
} from '@mui/material';
import API_BASE_URL from '../config';
import SearchIcon from '@mui/icons-material/Search';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

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

  useEffect(() => { fetchFamilies(); }, [fetchFamilies]);

  const filteredFamilies = useMemo(() => {
    return families.filter(fam =>
      fam.head_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.family_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [families, searchQuery]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress thickness={5} size={48} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      {/* Page Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.5px', mb: 0.3 }}>
          Church Directory
        </Typography>
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          {filteredFamilies.length} {tab === 0 ? 'active' : 'pending'} families
        </Typography>
      </Box>

      {/* Tabs */}
      {(role === 'admin' || role === 'incharge') && (
        <Box sx={{ px: 2.5, mb: 1.5 }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{
              bgcolor: '#fff',
              borderRadius: 3,
              p: 0.5,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #F1F5F9',
              minHeight: 44,
              '& .MuiTabs-indicator': { height: '100%', borderRadius: 2.5, bgcolor: '#EEF2FF', zIndex: 0 },
              '& .MuiTab-root': { zIndex: 1, fontWeight: 700, minHeight: 40, fontSize: '0.85rem' },
              '& .Mui-selected': { color: '#1E3A8A', fontWeight: 800 },
            }}
          >
            <Tab label="Active" />
            <Tab label="Pending" />
          </Tabs>
        </Box>
      )}

      {/* Search */}
      <Box sx={{ px: 2.5, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fff',
              borderRadius: 3,
              border: '1px solid #F1F5F9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Family List */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 4, mx: 2.5, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
        {filteredFamilies.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography color="textSecondary" fontWeight={600} variant="body2">
              No families found.
            </Typography>
          </Box>
        ) : (
          filteredFamilies.map((fam, idx) => (
            <Fade key={fam.family_id} in timeout={300 + idx * 30}>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    '&:active': { bgcolor: '#F8FAFC' },
                    '&:hover': { bgcolor: '#FAFBFC' },
                  }}
                  onClick={() => navigate(`/familydet/${fam.family_id}`)}
                >
                  {/* Avatar */}
                  <Avatar
                    src={fam.family_pic}
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: '#EEF2FF',
                      color: '#4F46E5',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    {!fam.family_pic && (fam.head_name || 'F').charAt(0)}
                  </Avatar>

                  {/* Info */}
                  <Box flex={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.4}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color="#1E293B"
                        noWrap
                        sx={{ maxWidth: '65%' }}
                      >
                        {fam.head_name}
                      </Typography>
                      <Chip
                        label={fam.active ? 'Active' : 'Pending'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 800,
                          bgcolor: fam.active ? '#ECFDF5' : '#FFF7ED',
                          color: fam.active ? '#10B981' : '#F59E0B',
                        }}
                      />
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOnRoundedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {fam.anbiyam}
                        </Typography>
                      </Box>
                      {fam.mobile_number && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneRoundedIcon sx={{ fontSize: 12, color: '#94A3B8' }} />
                          <Typography variant="caption" color="textSecondary">
                            {fam.mobile_number}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                    {fam.card_number && (
                      <Typography variant="caption" fontWeight={700} color="#4F46E5" sx={{ fontSize: '0.65rem' }}>
                        #{fam.card_number}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {(role === 'admin' || role === 'incharge') && (
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-family/${fam.family_id}`); }}
                        sx={{
                          bgcolor: '#F8FAFC',
                          color: '#64748B',
                          width: 32,
                          height: 32,
                          '&:hover': { bgcolor: '#F1F5F9', color: '#1E3A8A' },
                        }}
                      >
                        <EditRoundedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    )}
                    <ChevronRightRoundedIcon sx={{ color: '#CBD5E1', fontSize: 20 }} />
                  </Box>
                </Box>
                {idx < filteredFamilies.length - 1 && (
                  <Divider sx={{ ml: 9, opacity: 0.5 }} />
                )}
              </Box>
            </Fade>
          ))
        )}
      </Box>
    </Box>
  );
};

export default FamilyList;
