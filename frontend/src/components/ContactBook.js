import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Avatar, Stack,
  CircularProgress, IconButton, InputAdornment, Collapse, Divider
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
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

  const filteredContacts = families.filter(fam => {
    const headName = fam.head_name || '';
    return (
      headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fam.anbiyam && fam.anbiyam.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (fam.mobile_number && fam.mobile_number.includes(searchQuery))
    );
  });

  const groupedContacts = filteredContacts.reduce((acc, fam) => {
    const firstLetter = (fam.head_name || 'Unknown').charAt(0).toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(fam);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedContacts).sort();

  const handleCall = (number) => { window.location.href = `tel:${number}`; };
  const handleWhatsApp = (number) => { window.open(`https://wa.me/91${number.replace(/\D/g, '')}`, '_blank'); };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
      <CircularProgress size={40} sx={{ color: '#1E3A8A' }} />
    </Box>
  );

  return (
    <Box sx={{ pb: 12, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Title */}
      <Box sx={{ pt: 2.5, pb: 1, px: 2.5 }}>
        <Typography variant="h5" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-0.3px', mb: 0.3 }}>
          Contact Book
        </Typography>
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          {filteredContacts.length} contacts
        </Typography>
      </Box>

      {/* Sticky Search */}
      <Box
        sx={{
          position: 'sticky',
          top: 56,
          zIndex: 100,
          bgcolor: '#F8FAFC',
          pt: 1,
          pb: 1.5,
          px: 2.5,
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search name, anbiyam or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
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

      {/* Empty state */}
      {sortedLetters.length === 0 && (
        <Box textAlign="center" py={10}>
          <Typography color="textSecondary" variant="body2" fontWeight={600}>
            No contacts found.
          </Typography>
        </Box>
      )}

      {/* Grouped Contact List */}
      {sortedLetters.map(letter => (
        <Box key={letter}>
          {/* Letter header */}
          <Box
            sx={{
              position: 'sticky',
              top: 116,
              zIndex: 90,
              bgcolor: '#EFF1F5',
              py: 0.6,
              px: 2.5,
              borderBottom: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <Typography variant="caption" fontWeight={900} color="#64748B" sx={{ textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              {letter}
            </Typography>
          </Box>

          {/* Contact rows */}
          <Box sx={{ bgcolor: '#fff', mx: 2.5, borderRadius: 4, overflow: 'hidden', border: '1px solid #F1F5F9', mb: 2, mt: 1 }}>
            {groupedContacts[letter]
              .sort((a, b) => (a.head_name || '').localeCompare(b.head_name || ''))
              .map((fam, idx, arr) => (
                <Box key={fam.family_id}>
                  {/* Main row */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      py: 1.5,
                      gap: 2,
                      bgcolor: expandedId === fam.family_id ? '#F8FAFC' : 'transparent',
                      transition: 'all 0.15s',
                      '&:active': { bgcolor: '#F1F5F9' },
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      src={fam.family_pic}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: '#1E3A8A',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(30,58,138,0.12)',
                      }}
                      onClick={() => setExpandedId(expandedId === fam.family_id ? null : fam.family_id)}
                    >
                      {(fam.head_name || 'U').charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Name + Anbiyam */}
                    <Box
                      flex={1}
                      minWidth={0}
                      onClick={() => setExpandedId(expandedId === fam.family_id ? null : fam.family_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} color="#1E293B" noWrap>
                        {fam.head_name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="#64748B" noWrap display="block">
                        {fam.anbiyam || 'General'}
                      </Typography>
                    </Box>

                    {/* Action buttons */}
                    <Stack direction="row" spacing={0.8}>
                      {fam.mobile_number && (
                        <IconButton
                          onClick={(e) => { e.stopPropagation(); handleCall(fam.mobile_number); }}
                          size="small"
                          sx={{
                            color: '#10B981',
                            bgcolor: '#ECFDF5',
                            width: 36,
                            height: 36,
                            borderRadius: 2.5,
                            '&:hover': { bgcolor: '#D1FAE5' },
                          }}
                        >
                          <PhoneIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleWhatsApp(fam.mobile_number || fam.mobile_number2); }}
                        size="small"
                        sx={{
                          color: '#25D366',
                          bgcolor: '#F0FDF4',
                          width: 36,
                          height: 36,
                          borderRadius: 2.5,
                          '&:hover': { bgcolor: '#DCFCE7' },
                        }}
                      >
                        <WhatsAppIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedId(expandedId === fam.family_id ? null : fam.family_id)}
                        sx={{ color: '#94A3B8', width: 28, height: 36 }}
                      >
                        {expandedId === fam.family_id
                          ? <ExpandLessRoundedIcon sx={{ fontSize: 18 }} />
                          : <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Expanded secondary number */}
                  <Collapse in={expandedId === fam.family_id}>
                    <Box
                      sx={{
                        px: 2,
                        pb: 2,
                        ml: 9,
                        bgcolor: '#F8FAFC',
                        borderTop: '1px solid #F1F5F9',
                        pt: 1.5,
                      }}
                    >
                      <Box mb={1}>
                        <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.3px' }}>Primary</Typography>
                        <Typography variant="body2" fontWeight={700} color="#1E293B">
                          {fam.mobile_number || 'Not available'}
                        </Typography>
                      </Box>
                      {fam.mobile_number2 && (
                        <Box>
                          <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.3px' }}>Secondary</Typography>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.3}>
                            <Typography variant="body2" fontWeight={700} color="#1E293B">{fam.mobile_number2}</Typography>
                            <Stack direction="row" spacing={0.8}>
                              <IconButton onClick={() => handleCall(fam.mobile_number2)} size="small" sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', p: 0.6, borderRadius: 2 }}>
                                <PhoneIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                              <IconButton onClick={() => handleWhatsApp(fam.mobile_number2)} size="small" sx={{ color: '#7C3AED', bgcolor: '#F5F3FF', p: 0.6, borderRadius: 2 }}>
                                <WhatsAppIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>

                  {idx < arr.length - 1 && <Divider sx={{ ml: 9, opacity: 0.5 }} />}
                </Box>
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ContactBook;
