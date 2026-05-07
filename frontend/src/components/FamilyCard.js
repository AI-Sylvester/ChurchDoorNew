import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  TextField,
  Grid,
  Slide,
  InputAdornment,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import API_BASE_URL from '../config';
import axios from 'axios';

const FamilyCard = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [startX, setStartX] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFamiliesData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/list?limit=10000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamilies(res.data.families || res.data);
      } catch (err) {
        console.error('Failed to fetch family data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFamiliesData();
  }, [token]);

  const sortedFamilies = [...families].sort((a, b) =>
    (a.head_name || '').toLowerCase().localeCompare((b.head_name || '').toLowerCase())
  );

  const filteredFamilies = sortedFamilies.filter((fam) => {
    const term = searchTerm.toLowerCase();
    return (
      (fam.head_name || '').toLowerCase().includes(term) ||
      (fam.anbiyam || '').toLowerCase().includes(term) ||
      (fam.mobile_number || '').includes(term) ||
      (fam.family_id || '').toLowerCase().includes(term)
    );
  });

  const handleCardClick = async (fam) => {
    try {
      setMembersLoading(true);
      setSelectedFamily(fam);
      const res = await axios.get(`${API_BASE_URL}/member/byFamily/${fam.family_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCall = (number) => {
    if (number) window.location.href = `tel:${number}`;
  };

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      {/* Scrollable Title Section */}
      <Box sx={{ pt: 4, pb: 1, px: 2.5 }}>
        <Typography variant="h4" fontWeight={900} color="#1E3A8A" sx={{ letterSpacing: '-1px', mb: 0.5 }}>
          Family Cards
        </Typography>
        <Typography variant="body2" color="textSecondary" fontWeight={500}>
          Browse and manage parish families
        </Typography>
      </Box>

      {/* Fixed Sticky Search Bar with Glassmorphism */}
      <Box 
        sx={{ 
          position: 'sticky', 
          top: 64, // Matches Layout AppBar height
          zIndex: 100,
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(10px)',
          pt: 1.5,
          pb: 2,
          px: 2.5,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by name, ID, or mobile..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: 4,
              backgroundColor: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              height: 50,
              fontSize: '0.95rem',
              '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
              '&:hover fieldset': { borderColor: '#1E3A8A' },
            } 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', ml: 1 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ px: 2.5, pt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredFamilies.length > 0 ? (
              filteredFamilies.map((fam) => (
                <Card
                  key={fam.family_id}
                  onClick={() => handleCardClick(fam)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:active': { transform: 'scale(0.98)', bgcolor: '#F1F5F9' },
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      borderColor: 'rgba(30, 58, 138, 0.15)',
                    }
                  }}
                  onTouchStart={(e) => setStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    const endX = e.changedTouches[0].clientX;
                    const deltaX = endX - startX;
                    if (deltaX > 100) handleCall(fam.mobile_number);
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={fam.family_pic || ''}
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mr: 2.5, 
                      borderRadius: 3,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      bgcolor: '#1E3A8A',
                      fontWeight: 800,
                      fontSize: '1.5rem'
                    }}
                  >
                    {fam.head_name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={800} color="#1E293B" noWrap sx={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                      {fam.head_name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <Box sx={{ 
                        px: 1, 
                        py: 0.3, 
                        bgcolor: 'rgba(30, 58, 138, 0.08)', 
                        color: '#1E3A8A', 
                        borderRadius: 1.5,
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        {fam.family_id}
                      </Box>
                      <Typography variant="caption" color="#64748B" fontWeight={600} noWrap>
                        {fam.anbiyam || 'General Area'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="textSecondary" display="block" noWrap sx={{ mt: 0.5, opacity: 0.8 }}>
                      {fam.address_line2 || 'No Address'}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    {fam.mobile_number && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleCall(fam.mobile_number); }}
                        sx={{ color: '#10B981', bgcolor: '#ECFDF5' }}
                      >
                        <PhoneIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      sx={{ color: '#94A3B8' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(fam);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>
                </Card>
              ))
            ) : (
              <Box textAlign="center" py={10}>
                <Typography color="textSecondary" fontWeight={600}>No families match your search.</Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={Boolean(selectedFamily) && !showImage}
        onClose={() => setSelectedFamily(null)}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { borderRadius: 5, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1E3A8A', color: '#fff' }}>
          <Typography variant="h6" fontWeight={800}>Family Details</Typography>
          <IconButton onClick={() => setSelectedFamily(null)} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedFamily && (
            <Box>
              {/* Header inside dialog */}
              <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(30, 58, 138, 0.02)' }}>
                <Avatar
                  src={selectedFamily.family_pic || ''}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2, borderRadius: 5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                  onClick={() => setShowImage(true)}
                />
                <Typography variant="h5" fontWeight={900} color="#1E293B">
                  {selectedFamily.head_name}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={700}>
                  ID: {selectedFamily.family_id}
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(selectedFamily)
                    .filter(([key]) => !['id','created_by', 'family_pic', 'location', 'active'].includes(key))
                    .map(([key, value]) => (
                      <Grid item xs={6} key={key}>
                        <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', display: 'block' }}>
                          {key.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="#334155">
                          {value || '-'}
                        </Typography>
                      </Grid>
                    ))}
                </Grid>

                <Box mt={4}>
                  <Typography variant="overline" fontWeight={900} color="#1E3A8A">Members List</Typography>
                  {membersLoading ? (
                    <Box py={2}><CircularProgress size={20} /></Box>
                  ) : members.length > 0 ? (
                    <Stack spacing={1} mt={1}>
                      {members.map((m) => (
                        <Box key={m.member_id} sx={{ p: 1.5, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#1E293B">{m.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Age: {m.age} | {m.relationship} | {m.mobile || 'No Mobile'}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No members recorded.</Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setSelectedFamily(null)} fullWidth variant="contained" sx={{ borderRadius: 3, py: 1.2, fontWeight: 800 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image View */}
      <Dialog
        fullScreen
        open={showImage}
        onClose={() => setShowImage(false)}
        TransitionComponent={Slide}
      >
        <Box sx={{ height: '100%', bgcolor: '#000', display: 'flex', flexDirection: 'column', p: 2 }}>
          <IconButton onClick={() => setShowImage(false)} sx={{ color: '#fff', alignSelf: 'flex-end' }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => setShowImage(false)}>
            <img src={selectedFamily?.family_pic} alt="Full" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12 }} />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FamilyCard;
