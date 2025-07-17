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
  IconButton,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ClearIcon from '@mui/icons-material/Clear';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useTheme, useMediaQuery } from '@mui/material';
const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all');
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const filterChips = [
    { label: 'Child (0-3)', key: 'child' },
    { label: 'Kids (4-15)', key: 'kids' },
    { label: 'Youth (16-27)', key: 'youth' },
    { label: 'Sr. Citizen (55+)', key: 'senior' },
  ];

  const toggleFilter = (key) => {
    setFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const filteredMembers = members.filter((m) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = Object.values(m).some((val) =>
      val && val.toString().toLowerCase().includes(query)
    );

    const age = parseInt(m.age, 10);
    const sex = (m.sex || '').toLowerCase();
    const marital = (m.marital_status || '').toLowerCase();

const matchesGender = genderFilter === 'all' || sex === genderFilter;

    const passesFilters = filters.every((f) => {
      if (f === 'child') return age >= 0 && age <= 3;
      if (f === 'kids') return age > 3 && age <= 15;
      if (f === 'youth') return age >= 16 && age <= 27 && marital === 'single';
      if (f === 'senior') return age >= 55;
      return true;
    });

    return matchesSearch && matchesGender && passesFilters;
  });
const handleMemberPDFExport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = 'Filtered Member List';
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
  const fileName = `Members_${genderFilter}_${timestamp}.pdf`;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#0B3D91');
  doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 20);

  autoTable(doc, {
    startY: 30,
    head: [['S.No', 'ID', 'Name', 'Gender', 'Mobile', 'Age', 'Profession']],
    body: filteredMembers.map((mem, index) => [
      index + 1,
      mem.member_id || '-',
      mem.name || '-',
      mem.sex || '-',
      mem.mobile || '-',
      mem.age || '-',
      mem.profession || '-',
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [11, 61, 145],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 249, 255] },
    styles: { fontSize: 10, cellPadding: 4, textColor: 20 },
    margin: { left: 15, right: 15 },
  });

  const pdfBlob = doc.output('blob');
  saveAs(pdfBlob, fileName);
};
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

  <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} flexWrap="wrap" justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'center'} mb={2} gap={2}>
  
  {/* Gender Filter */}
  <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap={1}>
    {isMobile ? (
      <FormControl fullWidth size="small">
        <InputLabel>Gender</InputLabel>
        <Select
          value={genderFilter}
          label="Gender"
          onChange={(e) => setGenderFilter(e.target.value)}
        >
            <MenuItem value="All">All</MenuItem>
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
      </FormControl>
    ) : (
      ['all', 'male', 'female'].map((key) => {
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  const count = key === 'all' 
    ? members.length 
    : members.filter((m) => (m.sex || '').toLowerCase() === key).length;
  const selected = genderFilter === key;

  return (
    <Button
      key={key}
      onClick={() => setGenderFilter(key)}
      sx={{
        borderRadius: 20,
        px: 2,
        textTransform: 'none',
        backgroundColor: selected ? '#1976d2' : '#fff',
        color: selected ? '#fff' : '#555',
        border: `1px solid ${selected ? '#1976d2' : '#ccc'}`,
        '&:hover': {
          backgroundColor: selected ? '#1565c0' : '#f9f9f9',
        },
      }}
      startIcon={
        selected ? (
          <RadioButtonCheckedIcon sx={{ fontSize: 18 }} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
        )
      }
    >
      {label} ({count})
    </Button>
  );
})
    )}
  </Box>

  {/* Age Group Filters */}
  <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={1}>
    {isMobile ? (
      <FormControl fullWidth size="small">
        <InputLabel>Age Group</InputLabel>
        <Select
          multiple
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
          renderValue={(selected) => selected.map(f => filterChips.find(c => c.key === f)?.label).join(', ')}
        >
          {filterChips.map(({ label, key }) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ) : (
      filterChips.map(({ label, key }) => {
        const count = members.filter((m) => {
          const age = parseInt(m.age, 10);
          const marital = (m.marital_status || '').toLowerCase();
          if (key === 'child') return age >= 0 && age <= 3;
          if (key === 'kids') return age > 3 && age <= 15;
          if (key === 'youth') return age >= 16 && age <= 27 && marital === 'single';
          if (key === 'senior') return age >= 55;
          return false;
        }).length;

        return (
          <Button
            key={key}
            variant={filters.includes(key) ? 'contained' : 'outlined'}
            size="small"
            color="primary"
            onClick={() => toggleFilter(key)}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              fontWeight: 'bold',
              backgroundColor: filters.includes(key) ? '#1976d2' : '#f0f0f0',
              color: filters.includes(key) ? '#fff' : '#333',
              '&:hover': {
                backgroundColor: filters.includes(key) ? '#1565c0' : '#e0e0e0',
              },
            }}
          >
            {label} ({count})
          </Button>
        );
      })
    )}
  </Box>

  {/* Action Buttons */}
  <Box display="flex" gap={1} alignItems="center">
    <Button
      variant="contained"
      color="secondary"
      onClick={handleMemberPDFExport}
      sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 600 }}
    >
      Export PDF
    </Button>
    {(filters.length > 0 || genderFilter !== 'all') && (
      <IconButton
        size="small"
        color="error"
        onClick={() => {
          setFilters([]);
         setGenderFilter('all');
        }}
      >
        <ClearIcon />
      </IconButton>
    )}
  </Box>
</Box>
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
       <Box sx={{ overflowX: 'auto' }}>
  <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, minWidth: 800 }}>
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          {[
            'ID', 'Name', 'Sex', 'Age',
            'Profession', 'Mobile', 'Residing', 'Actions'
          ].map((head, index) => (
            <TableCell
              key={index}
              sx={{
                backgroundColor: '#0B3D91',
                color: '#fff',
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}
            >
              {head}
            </TableCell>
          ))}
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
