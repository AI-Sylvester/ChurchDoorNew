import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Card,
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
          params: { limit: 1000 } // Fetch a large batch for searching
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

  // Group by first letter of head_name
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
    <Box sx={{ p: 2, pb: 10 }}>
      <Typography variant="h4" fontWeight={800} color="#1E3A8A" mb={3} px={1}>
        Contact Book
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by name, area or mobile..."
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ 
          mb: 4, 
          '& .MuiOutlinedInput-root': { 
            borderRadius: 4,
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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

      {sortedLetters.length === 0 ? (
        <Typography textAlign="center" color="textSecondary" py={4}>
          No contacts found.
        </Typography>
      ) : (
        sortedLetters.map(letter => (
          <Box key={letter} sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={800} color="#3B82F6" mb={2} sx={{ pl: 1 }}>
              {letter}
            </Typography>
            <Stack spacing={1}>
              {groupedContacts[letter].sort((a, b) => a.head_name.localeCompare(b.head_name)).map((fam) => (
                <Card 
                  key={fam.family_id}
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    bgcolor: expandedId === fam.family_id ? '#F8FAFC' : '#fff'
                  }}
                  onClick={() => setExpandedId(expandedId === fam.family_id ? null : fam.family_id)}
                >
                  <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={fam.family_pic}
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: '#1E3A8A', 
                        mr: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 700
                      }}
                    >
                      {fam.head_name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="#1E293B" noWrap>
                        {fam.head_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block" noWrap>
                        {fam.anbiyam || 'No Area'}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.5}>
                      {fam.mobile_number && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleCall(fam.mobile_number); }}
                              size="small"
                              sx={{ bgcolor: '#ECFDF5', color: '#10B981', p: 0.5 }}
                            >
                              <PhoneIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleWhatsApp(fam.mobile_number); }}
                              size="small"
                              sx={{ bgcolor: '#F0FDF4', color: '#25D366', p: 0.5 }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Stack>
                        </Box>
                      )}

                      {fam.mobile_number2 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 1 }}>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleCall(fam.mobile_number2); }}
                              size="small"
                              sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', p: 0.5 }}
                            >
                              <PhoneIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton 
                              onClick={(e) => { e.stopPropagation(); handleWhatsApp(fam.mobile_number2); }}
                              size="small"
                              sx={{ bgcolor: '#F5F3FF', color: '#7C3AED', p: 0.5 }}
                            >
                              <WhatsAppIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  <Collapse in={expandedId === fam.family_id}>
                    <Box sx={{ p: 1.5, pt: 0, px: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" fontWeight={700} color="#10B981">
                        Mobile 1: {fam.mobile_number || '-'}
                      </Typography>
                      {fam.mobile_number2 && (
                        <Typography variant="body2" fontWeight={700} color="#3B82F6">
                          Mobile 2: {fam.mobile_number2}
                        </Typography>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              ))}
            </Stack>
          </Box>
        ))
      )}
    </Box>
  );
};

export default ContactBook;
