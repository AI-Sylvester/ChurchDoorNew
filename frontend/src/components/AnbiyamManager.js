import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Typography,
  Stack,
  Card,
  useTheme,
  useMediaQuery,
  Avatar,
  Fade,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import API_BASE_URL from '../config';

const AnbiyamManager = () => {
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', serial_no: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/anbiyam`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching anbiyams:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setIsEditing(false);
    setForm({ id: null, name: '', serial_no: '' });
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Anbiyam?')) {
      try {
        await axios.delete(`${API_BASE_URL}/anbiyam/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchItems();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/anbiyam/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/anbiyam`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setDialogOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} px={1}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#1E3A8A" sx={{ letterSpacing: '-1px' }}>
            Anbiyam List
          </Typography>
          <Typography variant="body2" color="textSecondary" fontWeight={500}>
            Manage parish small Christian communities
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={openAdd}
          sx={{ 
            borderRadius: 3, 
            px: 3, 
            py: 1, 
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
            textTransform: 'none',
            fontWeight: 700
          }}
        >
          Add New
        </Button>
      </Box>

      {isMobile ? (
        <Stack spacing={2}>
          {items.map((item) => (
            <Fade in key={item.id}>
              <Card sx={{ 
                p: 2, 
                borderRadius: 4, 
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Avatar sx={{ bgcolor: 'rgba(30, 58, 138, 0.1)', color: '#1E3A8A', mr: 2, borderRadius: 2, fontWeight: 900 }}>
                  {item.serial_no}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Anbiyam ID: {item.id}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: '#6366F1', bgcolor: '#F5F3FF' }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2' }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </Card>
            </Fade>
          ))}
          {items.length === 0 && !loading && (
            <Typography variant="body2" textAlign="center" py={5} color="textSecondary">No Anbiyams found.</Typography>
          )}
        </Stack>
      ) : (
        <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Serial No.</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Anbiyam Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Internal ID</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography fontWeight={700} color="primary">{item.serial_no}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{item.name}</Typography>
                  </TableCell>
                  <TableCell color="textSecondary">{item.id}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(item)} sx={{ color: '#6366F1' }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(item.id)} sx={{ color: '#EF4444' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#1E3A8A' }}>
          {isEditing ? 'Edit Anbiyam' : 'Add New Anbiyam'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={3}>
            Please enter the details for the small Christian community.
          </Typography>
          <TextField
            margin="dense"
            label="Serial Number"
            name="serial_no"
            type="number"
            fullWidth
            variant="filled"
            value={form.serial_no}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Anbiyam Name"
            name="name"
            fullWidth
            variant="filled"
            value={form.name}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnbiyamManager;
