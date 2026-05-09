import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Avatar, Stack, Fade, IconButton, 
  Card, InputAdornment, TextField, Grid, CardActionArea, 
  Collapse, Paper, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import API_BASE_URL from '../config';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

const ChevronRightRoundedIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.member_id?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGender = genderFilter === 'all' || m.sex === genderFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'approved' ? m.verification_status === 'approved' : m.verification_status !== 'approved');
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [members, searchQuery, genderFilter, statusFilter]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress thickness={5} size={50} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 12, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px', mb: 1 }}>
            Parish Directory
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>
            {members.length} registered individuals
          </Typography>
        </Box>
        <IconButton 
          onClick={() => setShowFilters(!showFilters)} 
          sx={{ 
            bgcolor: showFilters ? '#1E3A8A' : '#fff', 
            color: showFilters ? '#fff' : '#64748B',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: showFilters ? '#1E3A8A' : '#F1F5F9' }
          }}
        >
          <FilterListIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        placeholder="Search members by name or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ 
          mb: 2, 
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

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2.5, mb: 4, borderRadius: 5, border: '1px solid #E2E8F0', bgcolor: '#fff' }} elevation={0}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 700 }}>Gender</InputLabel>
                <Select 
                  value={genderFilter} 
                  label="Gender" 
                  onChange={(e) => setGenderFilter(e.target.value)}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                  <MenuItem value="all">All Genders</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontWeight: 700 }}>Status</InputLabel>
                <Select 
                  value={statusFilter} 
                  label="Status" 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      <Grid container spacing={2.5}>
        {filteredMembers.map((member, idx) => (
          <Grid item xs={12} sm={6} lg={4} key={member.member_id}>
            <Fade in timeout={400 + (idx * 50)}>
              <Card 
                sx={{ 
                  borderRadius: 6, 
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 20px 40px rgba(30, 58, 138, 0.1)',
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(`/familydet/${member.family_id}`)} 
                  sx={{ p: 3 }}
                >
                  <Box display="flex" alignItems="center" gap={2.5} mb={2.5}>
                    <Avatar
                      sx={{ 
                        width: 64, height: 64, 
                        borderRadius: 3,
                        bgcolor: member.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', 
                        color: member.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                        fontWeight: 900, fontSize: '1.2rem',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.5px', lineHeight: 1.1, mb: 0.5 }}>
                        {member.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" fontWeight={800} color="textSecondary" sx={{ textTransform: 'uppercase' }}>
                          {member.relationship} • {member.age} Yrs
                        </Typography>
                        <Box sx={{ 
                          px: 1, py: 0.2, borderRadius: 1.5, 
                          bgcolor: member.verification_status === 'approved' ? '#ECFDF5' : '#FFF7ED',
                          color: member.verification_status === 'approved' ? '#10B981' : '#F59E0B',
                          fontWeight: 900, fontSize: '0.55rem', textTransform: 'uppercase'
                        }}>
                          {member.verification_status === 'approved' ? 'Approved' : (member.verification_status || 'Approved')}
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  <Stack spacing={1.2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                       <Avatar sx={{ width: 28, height: 28, bgcolor: '#F8FAFC', color: '#64748B', borderRadius: 1.5 }}>
                         <PersonRoundedIcon sx={{ fontSize: 14 }} />
                       </Avatar>
                       <Typography variant="body2" fontWeight={700} color="#475569">ID: {member.member_id}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                       <Avatar sx={{ width: 28, height: 28, bgcolor: '#F8FAFC', color: '#64748B', borderRadius: 1.5 }}>
                         <SchoolRoundedIcon sx={{ fontSize: 14 }} />
                       </Avatar>
                       <Typography variant="body2" fontWeight={700} color="#475569" noWrap>{member.qualification || 'N/A'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                       <Avatar sx={{ width: 28, height: 28, bgcolor: '#F8FAFC', color: '#64748B', borderRadius: 1.5 }}>
                         <WorkRoundedIcon sx={{ fontSize: 14 }} />
                       </Avatar>
                       <Typography variant="body2" fontWeight={700} color="#475569" noWrap>{member.profession || 'N/A'}</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="caption" color="#94A3B8" fontWeight={800}>GO TO FAMILY PROFILE</Typography>
                     <ChevronRightRoundedIcon sx={{ color: '#CBD5E1' }} />
                  </Box>
                </CardActionArea>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {filteredMembers.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary" fontWeight={600}>No members found matching your filters.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MemberList;
