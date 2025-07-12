// updated component with enhanced dialog, 5-column layout, and restored View button
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import API_BASE_URL from '../config';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/member/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [token]);

  const handleView = (member) => {
    setEditMember({ ...member });
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleEdit = (member) => {
    setEditMember({ ...member });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditMember(null);
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/member/${editMember.member_id}`,
        editMember,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers((prev) =>
        prev.map((m) => (m.member_id === res.data.member_id ? res.data : m))
      );
      handleClose();
    } catch (err) {
      console.error('Update failed', err);
      setError('Failed to update member');
    }
  };

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    return Object.values(m).some(val =>
      val && val.toString().toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} color="#0B3D91" mb={2}>
        All Members
      </Typography>

      <TextField
        label="Search members"
        variant="outlined"
        size="small"
        fullWidth
        sx={{ mb: 2 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && !error && filteredMembers.length === 0 && (
        <Typography>No members found.</Typography>
      )}

      {filteredMembers.length > 0 && (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, minWidth: 800 }}>
    <Table size="small">
      <TableHead sx={{ backgroundColor: '#0B3D91' }}>
        <TableRow>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>ID</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Name</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sex</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Age</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Profession</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mobile</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Residing</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredMembers.map((m) => (
          <TableRow key={m.member_id} hover>
            <TableCell>{m.member_id}</TableCell>
            <TableCell>{m.name}</TableCell>
            <TableCell>{m.sex || '-'}</TableCell>
            <TableCell>{m.age ?? '-'}</TableCell>
            <TableCell>{m.profession || '-'}</TableCell>
            <TableCell>{m.mobile || '-'}</TableCell>
            <TableCell>{m.residing_here ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={1}>
                <Button variant="outlined" size="small" onClick={() => handleView(m)}>View</Button>
                <Button variant="contained" size="small" onClick={() => handleEdit(m)}>Edit</Button>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Box>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xl" fullWidth>
        <DialogTitle>{editMode ? 'Edit Member' : 'Member Details'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {editMember && Object.entries(editMember)
              .filter(([field]) => !['id', 'member_id', 'family_id'].includes(field))
              .map(([field, value]) => {
                const isDate = field.endsWith('_date') || field === 'dob';
                const isBoolean = ['active', 'residing_here'].includes(field);
                const handleChange = (e) =>
                  setEditMember(prev => ({
                    ...prev,
                    [field]: isBoolean ? e.target.checked : e.target.value
                  }));

                const label = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                if (!editMode) {
                  return (
                    <Grid item xs={12} sm={2.4} key={field}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{
                        isDate && value ? new Date(value).toLocaleDateString('en-GB') :
                        isBoolean ? (value ? 'Yes' : 'No') :
                        value || '-'
                      }</Typography>
                    </Grid>
                  );
                }

                if (['sex', 'marital_status', 'relationship'].includes(field)) {
                  const options = {
                    sex: ['Male', 'Female', 'Transgender'],
                    marital_status: ['Single', 'Married', 'Divorced', 'Widowed'],
                    relationship: ['Head', 'Spouse', 'Child', 'Parent', 'Other']
                  };

                  return (
                    <Grid item xs={12} sm={2.4} key={field}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{label}</InputLabel>
                        <Select value={value || ''} label={label} onChange={handleChange}>
                          <MenuItem value="">--Select--</MenuItem>
                          {options[field].map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  );
                }

                if (isBoolean) {
                  return (
                    <Grid item xs={12} sm={2.4} key={field}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>{label}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <input
                          type="checkbox"
                          checked={!!value}
                          onChange={handleChange}
                        />
                        <Typography>{value ? 'Yes' : 'No'}</Typography>
                      </Box>
                    </Grid>
                  );
                }

                return (
                  <Grid item xs={12} sm={2.4} key={field}>
                    <TextField
                      fullWidth
                      size="small"
                      type={isDate ? 'date' : 'text'}
                      label={label}
                      value={isDate && value ? new Date(value).toISOString().split('T')[0] : value || ''}
                      onChange={handleChange}
                      InputLabelProps={isDate ? { shrink: true } : undefined}
                    />
                  </Grid>
                );
              })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">Close</Button>
          {editMode && <Button onClick={handleSave} variant="contained">Save</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberList;
