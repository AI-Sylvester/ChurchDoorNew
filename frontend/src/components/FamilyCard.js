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
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import API_BASE_URL from '../config';
import axios from 'axios';

const FamilyCard = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [startX, setStartX] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamilies(res.data);
      } catch (err) {
        console.error('Failed to fetch family data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, [token]);

const sortedFamilies = [...families].sort((a, b) =>
  a.head_name?.localeCompare(b.head_name)
);

const filteredFamilies = sortedFamilies.filter((fam) => {
  const term = searchTerm.toLowerCase();
  return (
    fam.head_name?.toLowerCase().includes(term) ||
    fam.anbiyam?.toLowerCase().includes(term) ||
    fam.mobile_number?.toLowerCase().includes(term)
  );
});

  const handleSwipeStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleSwipeEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    if (deltaX > 100 && selectedFamily?.mobile_number) {
      window.location.href = `tel:${selectedFamily.mobile_number}`;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search Family"
        size="small"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          {filteredFamilies.length > 0 ? (
            filteredFamilies.map((fam) => (
              <Card
  key={fam.family_id}
  sx={{
    display: 'flex',
    alignItems: 'center',
    p: 1.2,
    borderRadius: 2,
    boxShadow: 1,
    bgcolor: '#f5f5f5',
    color: '#111',
    '&:hover': {
      bgcolor: '#e0e0e0',
    },
  }}
>
  <Avatar
    variant="square"
    src={fam.family_pic || ''}
    alt={fam.head_name}
    
    sx={{ width: 56, height: 56, mr: 2, cursor: 'pointer' }}
  />

  <Box sx={{ flex: 1 }}>
    <Typography fontWeight={600} fontSize="1rem" noWrap>
      {fam.head_name}
    </Typography>
    <Typography variant="body2" sx={{ color: '#555' }} noWrap>
      {fam.mobile_number || 'No mobile'} • {fam.anbiyam || 'No Anbiyam'}
    </Typography>
  </Box>

  <IconButton
    size="small"
    sx={{ color: '#666' }}
    onClick={(e) => {
      e.stopPropagation();       // Prevent card click default (if added in future)
      setSelectedFamily(fam);    // Show only details dialog
    }}
  >
    <MoreVertIcon />
  </IconButton>
</Card>
            ))
          ) : (
            <Typography textAlign="center" color="text.secondary">
              No families found.
            </Typography>
          )}
        </Stack>
      )}

      {/* Family Details Dialog */}
      <Dialog
        open={Boolean(selectedFamily) && !showImage}
        onClose={() => setSelectedFamily(null)}
        maxWidth="sm"
        fullWidth
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Family Details
          <IconButton
            aria-label="close"
            onClick={() => setSelectedFamily(null)}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFamily ? (
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Avatar
                  src={selectedFamily.family_pic || ''}
                  alt={selectedFamily.head_name}
                  sx={{ width: '100%', height: 'auto', borderRadius: 2 }}
                  onClick={() => setShowImage(true)}
                />
              </Grid>
              <Grid item xs={8}>
              {Object.entries(selectedFamily)
  .filter(([key]) => !['id','created_by', 'family_pic', 'location'].includes(key))
  .map(([key, value]) => {
    let displayValue = value;

    if (key === 'created_at' && value) {
      const dateObj = new Date(value);
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      displayValue = `${dd}-${mm}-${yyyy}`;
    }

    return (
      <Box key={key} sx={{ mb: 1 }}>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          component="span"
          sx={{ textTransform: 'capitalize', mr: 1 }}
        >
          {key.replace(/_/g, ' ')}:
        </Typography>
        <Typography component="span">
          {displayValue === null || displayValue === '' ? '-' : displayValue.toString()}
        </Typography>
      </Box>
    );
  })}
              </Grid>
            </Grid>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedFamily(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Image View */}
      <Dialog
        fullScreen
        open={showImage}
        onClose={() => setShowImage(false)}
        TransitionComponent={Slide}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            p: 2,
          }}
        >
          <IconButton
            onClick={() => setShowImage(false)}
            sx={{ color: '#fff', alignSelf: 'flex-end' }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onClick={() => setShowImage(false)}
          >
            <img
              src={selectedFamily?.family_pic}
              alt={selectedFamily?.head_name}
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default FamilyCard;
