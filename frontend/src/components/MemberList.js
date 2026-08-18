import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Avatar, Fade, IconButton,
  InputAdornment, TextField, Divider, Stack, Chip,
  Collapse, Paper, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import API_BASE_URL from '../config';
import SearchIcon from '@mui/icons-material/Search';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router-dom';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/member/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = (
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.member_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesGender = genderFilter === 'all' || m.sex === genderFilter;
      const matchesStatus = statusFilter === 'all' || (
        statusFilter === 'approved' ? m.verification_status === 'approved' : m.verification_status !== 'approved'
      );
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [members, searchQuery, genderFilter, statusFilter]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress thickness={5} size={48} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.5px', mb: 0.3 }}>
              Parish Members
            </Typography>
            <Typography variant="caption" color="textSecondary" fontWeight={600}>
              {filteredMembers.length} of {members.length} members
            </Typography>
          </Box>
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              bgcolor: showFilters ? '#1E3A8A' : '#fff',
              color: showFilters ? '#fff' : '#64748B',
              width: 40,
              height: 40,
              borderRadius: 2.5,
              border: `1px solid ${showFilters ? '#1E3A8A' : '#E2E8F0'}`,
              '&:hover': { bgcolor: showFilters ? '#1E3A8A' : '#F1F5F9' },
            }}
          >
            <FilterListRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2.5, mb: 1.5 }}>
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

      {/* Filters */}
      <Collapse in={showFilters}>
        <Box sx={{ px: 2.5, mb: 1.5 }}>
          <Paper
            elevation={0}
            sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#fff' }}
          >
            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Gender</InputLabel>
                <Select
                  value={genderFilter}
                  label="Gender"
                  onChange={(e) => setGenderFilter(e.target.value)}
                  sx={{ borderRadius: 2.5, fontWeight: 700 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 2.5, fontWeight: 700 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Box>
      </Collapse>

      {/* Member List */}
      <Box sx={{ bgcolor: '#fff', borderRadius: 4, mx: 2.5, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
        {filteredMembers.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography color="textSecondary" fontWeight={600} variant="body2">
              No members found matching your filters.
            </Typography>
          </Box>
        ) : (
          filteredMembers.map((member, idx) => (
            <Fade key={member.member_id} in timeout={300 + idx * 20}>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5,
                    gap: 2,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:active': { bgcolor: '#F8FAFC' },
                    '&:hover': { bgcolor: '#FAFBFC' },
                  }}
                  onClick={() => navigate(`/familydet/${member.family_id}`)}
                >
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: member.sex === 'Male' ? '#EFF6FF' : '#FFF1F2',
                      color: member.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    {member.name.charAt(0)}
                  </Avatar>

                  {/* Info */}
                  <Box flex={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.3}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color="#1E293B"
                        noWrap
                        sx={{ maxWidth: '60%' }}
                      >
                        {member.name}
                      </Typography>
                      <Chip
                        label={member.verification_status === 'approved' ? 'Active' : 'Pending'}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          bgcolor: member.verification_status === 'approved' ? '#ECFDF5' : '#FFF7ED',
                          color: member.verification_status === 'approved' ? '#10B981' : '#F59E0B',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary" fontWeight={600} display="block">
                      {member.relationship} • {member.age} Yrs • {member.sex}
                    </Typography>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.3 }}>
                      {member.profession && (
                        <Box display="flex" alignItems="center" gap={0.4}>
                          <WorkRoundedIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {member.profession}
                          </Typography>
                        </Box>
                      )}
                      {member.qualification && (
                        <Box display="flex" alignItems="center" gap={0.4}>
                          <SchoolRoundedIcon sx={{ fontSize: 11, color: '#94A3B8' }} />
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {member.qualification}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <ChevronRightRoundedIcon sx={{ color: '#CBD5E1', fontSize: 18, flexShrink: 0 }} />
                </Box>
                {idx < filteredMembers.length - 1 && (
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

export default MemberList;
