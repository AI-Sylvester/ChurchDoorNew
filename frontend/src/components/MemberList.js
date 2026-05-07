import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Card,
  CardActionArea,
  Collapse,
  Avatar,
  Fade,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

const ChevronRightRoundedIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? m.active : !m.active);
      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [members, searchQuery, genderFilter, statusFilter]);

  const handleView = (member) => {
    navigate(`/familydet/${member.family_id}`);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 12 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={900} color="#1E293B">
          Member Directory
        </Typography>
        <IconButton onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'default'}>
          <FilterListIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search members..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
        }}
      />

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#F8FAFC' }} elevation={0}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select value={genderFilter} label="Gender" onChange={(e) => setGenderFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {isMobile ? (
        <Stack spacing={2}>
          {filteredMembers.map((m, idx) => (
            <Fade in timeout={500 + (idx * 50)} key={m.member_id}>
              <Card 
                sx={{ 
                  borderRadius: 5, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)', 
                  position: 'relative',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(0.98)' }
                }}
              >
                <CardActionArea onClick={() => handleView(m)} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar 
                      sx={{ 
                        width: 54, 
                        height: 54, 
                        bgcolor: m.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', 
                        color: m.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.03)'
                      }}
                    >
                      {m.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1} sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={900} color="#1E293B" noWrap sx={{ letterSpacing: '-0.5px' }}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" fontWeight={700} display="block" noWrap>
                        {m.relationship} • {m.age} Years • {m.marital_status}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1} alignItems="center">
                         <Box sx={{
                          px: 1, py: 0.2, borderRadius: 1.5, display: 'inline-block',
                          bgcolor: m.active ? '#ECFDF5' : '#FEF2F2',
                          color: m.active ? '#10B981' : '#EF4444',
                          fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {m.active ? 'Active' : 'Inactive'}
                        </Box>
                        <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                          ID: {m.member_id}
                        </Typography>
                      </Stack>
                    </Box>
                    <ChevronRightRoundedIcon sx={{ color: '#E2E8F0', ml: 1 }} />
                  </Box>
                </CardActionArea>
              </Card>
            </Fade>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Member ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Relationship</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((m) => (
                <TableRow key={m.member_id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{m.member_id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{m.name}</TableCell>
                  <TableCell>{m.relationship}</TableCell>
                  <TableCell>{m.age}</TableCell>
                  <TableCell>
                    <Chip 
                      label={m.active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={m.active ? 'success' : 'error'}
                      sx={{ fontWeight: 800, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleView(m)} color="primary" size="small"><SearchIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredMembers.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary" fontWeight={600}>No members found.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default MemberList;
