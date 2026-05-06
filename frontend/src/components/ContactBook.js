import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
  Collapse,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import API_BASE_URL from '../config';

const ContactBook = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 1000 }
        });
        setFamilies(res.data.families || []);
      } catch (err) {
        console.error('Failed to fetch contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [token]);

  const filteredContacts = families.filter(fam => 
    fam.head_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fam.anbiyam && fam.anbiyam.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (fam.mobile_number && fam.mobile_number.includes(searchQuery))
  );

  const groupedContacts = filteredContacts.reduce((acc, fam) => {
    const firstLetter = fam.head_name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(fam);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedContacts).sort();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const handleWhatsApp = (number) => {
    window.open(`https://wa.me/91${number.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Box sx={{ pb: 10, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      {/* Scrollable Title */}
      <Box sx={{ pt: 3, pb: 1, px: 2 }}>
        <Typography variant="h5" fontWeight={900} color="#1E3A8A" sx={{ letterSpacing: '-0.5px' }}>
          Contact Book
        </Typography>
      </Box>

      {/* Sticky Search Bar - Only the bar stays fixed */}
      <Box 
        sx={{ 
          position: 'sticky', 
          top: 64, // Just below Layout AppBar
          zIndex: 100,
          backgroundColor: '#F8FAFC',
          pt: 1,
          pb: 1.5,
          px: 2,
          borderBottom: '1px solid rgba(0,0,0,0.03)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search contacts..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              borderRadius: 3,
              backgroundColor: '#fff',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
              '&:hover fieldset': { borderColor: '#1E3A8A' },
            } 
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {sortedLetters.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
          <Typography color="textSecondary" variant="body2">No contacts match your search.</Typography>
        </Box>
      ) : (
        sortedLetters.map(letter => (
          <Box key={letter}>
            {/* Sticky Letter Header - Adjusted top to follow search bar */}
            <Box 
              sx={{ 
                position: 'sticky', 
                top: 125, // Height of Search bar (approx 61px) + 64px AppBar
                zIndex: 90,
                bgcolor: '#F1F5F9',
                py: 0.5,
                px: 2,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="caption" fontWeight={900} color="#64748B" sx={{ textTransform: 'uppercase' }}>
                {letter}
              </Typography>
            </Box>

            <Stack divider={<Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.04)', mx: 2 }} />}>
              {groupedContacts[letter].sort((a, b) => a.head_name.localeCompare(b.head_name)).map((fam) => (
                <Box 
                  key={fam.family_id}
                  sx={{ 
                    bgcolor: expandedId === fam.family_id ? '#fff' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:active': { bgcolor: '#F1F5F9' }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => setExpandedId(expandedId === fam.family_id ? null : fam.family_id)}
                  >
                    <Avatar 
                      src={fam.family_pic}
                      sx={{ 
                        width: 44, 
                        height: 44, 
                        bgcolor: '#1E3A8A', 
                        mr: 2,
                        borderRadius: 1.5,
                        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.12)',
                        fontSize: '1.1rem',
                        fontWeight: 700
                      }}
                    >
                      {fam.head_name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={700} color="#1E293B" sx={{ lineHeight: 1.2 }}>
                        {fam.head_name}
                      </Typography>
                      <Typography variant="caption" color="#64748B" display="block">
                        {fam.anbiyam || 'General Area'}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      {fam.mobile_number && (
                        <IconButton 
                          onClick={(e) => { e.stopPropagation(); handleCall(fam.mobile_number); }}
                          size="small"
                          sx={{ 
                            color: '#10B981', 
                            bgcolor: '#ECFDF5',
                            '&:hover': { bgcolor: '#D1FAE5' }
                          }}
                        >
                          <PhoneIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={(e) => { e.stopPropagation(); handleWhatsApp(fam.mobile_number || fam.mobile_number2); }}
                        size="small"
                        sx={{ 
                          color: '#25D366', 
                          bgcolor: '#F0FDF4',
                          '&:hover': { bgcolor: '#DCFCE7' }
                        }}
                      >
                        <WhatsAppIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Collapse in={expandedId === fam.family_id}>
                    <Box sx={{ p: 2, pt: 0, pl: 8.5, display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>PRIMARY MOBILE</Typography>
                        <Typography variant="body2" fontWeight={700} color="#1E293B">
                          {fam.mobile_number || 'Not available'}
                        </Typography>
                      </Box>
                      {fam.mobile_number2 && (
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>SECONDARY MOBILE</Typography>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                            <Typography variant="body2" fontWeight={700} color="#1E293B">
                              {fam.mobile_number2}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <IconButton 
                                onClick={() => handleCall(fam.mobile_number2)}
                                size="small"
                                sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', p: 0.5 }}
                              >
                                <PhoneIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleWhatsApp(fam.mobile_number2)}
                                size="small"
                                sx={{ color: '#7C3AED', bgcolor: '#F5F3FF', p: 0.5 }}
                              >
                                <WhatsAppIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </Stack>
          </Box>
        ))
      )}
    </Box>
  );
};

export default ContactBook;
