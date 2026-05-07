import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControlLabel,
  Switch,
  Avatar,
  Stack,
  Fade,
  CardActionArea,
  IconButton,
  useMediaQuery,
  useTheme,
  Card,
  Collapse,
  Chip,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import API_BASE_URL from '../config';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const ChevronRightRoundedIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  
  const [imageOpen, setImageOpen] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();
  const [tab, setTab] = useState(0);

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
    return families.filter(fam => {
      const matchesSearch = (fam.head_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            fam.family_id?.toLowerCase().includes(searchQuery.toLowerCase()));
      // If we are in vetting tab, they are all technically inactive/pending
      const matchesStatus = tab === 1 ? true : (activeOnly ? fam.active : true);
      return matchesSearch && matchesStatus;
    });
  }, [families, searchQuery, activeOnly, tab]);

  const handleView = (familyId) => {
    navigate(`/familydet/${familyId}`);
  };

  const handleEdit = (familyId) => {
    navigate(`/edit-family/${familyId}`);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 12 }}>
      {(role === 'admin' || role === 'incharge') && (
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ mb: 3, borderBottom: '1px solid #E2E8F0' }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Active Directory" sx={{ fontWeight: 800 }} />
          <Tab label="Pending Vetting" sx={{ fontWeight: 800 }} />
        </Tabs>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or Family ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3, bgcolor: '#fff', borderRadius: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }} elevation={0}>
          <FormControlLabel
            control={<Switch checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />}
            label={<Typography variant="body2" fontWeight={700}>Show Active Only</Typography>}
          />
        </Paper>
      </Collapse>

      {isMobile ? (
        <Stack spacing={2}>
          {filteredFamilies.map((fam, idx) => (
            <Fade in timeout={500 + (idx * 50)} key={fam.family_id}>
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
                <CardActionArea onClick={() => handleView(fam.family_id)} sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      variant="rounded"
                      src={fam.family_pic}
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        bgcolor: '#F1F5F9', 
                        color: '#1E3A8A',
                        borderRadius: 3,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                        fontWeight: 900
                      }}
                    >
                      {!fam.family_pic && (fam.head_name || 'F').charAt(0)}
                    </Avatar>
                    <Box flex={1} sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={900} color="#1E293B" noWrap sx={{ letterSpacing: '-0.5px' }}>
                        {fam.head_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" fontWeight={600} display="block" noWrap>
                        {fam.anbiyam} • {fam.city}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1} alignItems="center">
                         <Box sx={{
                          px: 1, py: 0.2, borderRadius: 1.5, display: 'inline-block',
                          bgcolor: fam.active ? '#ECFDF5' : '#FFF7ED',
                          color: fam.active ? '#10B981' : '#F59E0B',
                          fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {fam.active ? 'Active' : 'Pending'}
                        </Box>
                        <Typography variant="caption" color="#94A3B8" fontWeight={700}>
                          ID: {fam.family_id}
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
                <TableCell sx={{ fontWeight: 900 }}>Family ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Head Name</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Anbiyam</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFamilies.map((fam) => (
                <TableRow key={fam.family_id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{fam.family_id}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{fam.head_name}</TableCell>
                  <TableCell>{fam.anbiyam}</TableCell>
                  <TableCell>
                    <Chip 
                      label={fam.active ? 'Active' : 'Pending'} 
                      size="small" 
                      color={fam.active ? 'success' : 'warning'}
                      sx={{ fontWeight: 800, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleView(fam.family_id)} color="primary" size="small"><SearchIcon /></IconButton>
                    <IconButton onClick={() => handleEdit(fam.family_id)} color="secondary" size="small"><EditIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredFamilies.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary" fontWeight={600}>No families found matching your criteria.</Typography>
        </Box>
      )}

      <Dialog open={imageOpen} onClose={() => setImageOpen(false)} maxWidth="md">
        <DialogContent>
          <Typography>No Image Available</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FamilyList;
