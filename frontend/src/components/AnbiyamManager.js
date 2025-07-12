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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import API_BASE_URL from '../config'; // e.g. 'http://localhost:5000/api'

const AnbiyamManager = () => {
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', serial_no: '' });
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('token');
const fetchItems = useCallback(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/anbiyam`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setItems(res.data);
  } catch (err) {
    console.error('Error fetching anbiyams:', err);
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
    if (window.confirm('Are you sure you want to delete this?')) {
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
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            Add
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Serial No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.serial_no}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(item)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{isEditing ? 'Edit Anbiyam' : 'Add Anbiyam'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Serial No."
            name="serial_no"
            type="number"
            fullWidth
            value={form.serial_no}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnbiyamManager;
