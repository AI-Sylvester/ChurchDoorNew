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
  Stack,
  Card,
  CardActionArea,
  Collapse,
  Avatar,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ClearIcon from '@mui/icons-material/Clear';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory,Encoding } from '@capacitor/filesystem';
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
  const [statusFilter, setStatusFilter] = useState('active');
  const [showFilters, setShowFilters] = useState(false);
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/member/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 10000 } // Fetch all for client-side filtering
        });
        setMembers(res.data.members || (Array.isArray(res.data) ? res.data : []));
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
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? m.active === true : m.active === false);
 
    const passesFilters = filters.every((f) => {
      if (f === 'child') return age >= 0 && age <= 3;
      if (f === 'kids') return age > 3 && age <= 15;
      if (f === 'youth') return age >= 16 && age <= 27 && marital === 'single';
      if (f === 'senior') return age >= 55;
      return true;
    });
 
    return matchesSearch && matchesGender && matchesStatus && passesFilters;
  });

const handleMemberPDFExport = async (filteredMembers, genderFilter = '', logoBase64 = '', filters = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // === LOGO (Optional) ===
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
    } catch (e) {
      console.warn('⚠️ Image not added:', e);
    }
  }

  // === TITLE ===
  const title = 'Filtered Member List';
  doc.setFontSize(16);
  doc.setTextColor('#0B3D91');
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  // === FILTER SUBTEXT ===
  doc.setFontSize(10);
  doc.setTextColor('#000');
  const filterLabelMap = {
    child: 'Child (0-3)',
    kids: 'Kids (4-15)',
    youth: 'Youth (16-27)',
    senior: 'Sr. Citizen (55+)',
  };
  const genderLabel = genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1);
  const ageLabels = filters.map((f) => filterLabelMap[f]).join(', ') || 'None';
  const filterText = `Gender: ${genderLabel} | Age Groups: ${ageLabels}`;
  doc.text(filterText, pageWidth / 2, 28, { align: 'center' });

  // === TABLE ===
  autoTable(doc, {
    startY: 35,
    head: [['S.No', 'ID', 'Name', 'Gender', 'Mobile', 'Age', 'Profession']],
    body: filteredMembers.map((m, i) => [
      i + 1,
      m.member_id || '-',
      m.name || '-',
      m.sex || '-',
      m.mobile || '-',
      m.age || '-',
      m.profession || '-',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { left: 10, right: 10 },
  });

  // === EXPORT PDF ===
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `Members_${genderFilter || 'Export'}_${timestamp}.pdf`;

  try {
    if (Capacitor.getPlatform() === 'web') {
      doc.save(fileName);
    } else {
      // ✅ Use same working logic from your working export
      const arrayBuffer = doc.output('arraybuffer');
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));

      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
        encoding: Encoding.Base64,
      });

      alert(`✅ PDF saved to device: ${fileName}`);
    }
  } catch (err) {
    console.error('❌ Error saving PDF:', err);
    alert('❌ Failed to generate/save PDF.');
  }
};

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700} color="#0B3D91">
          All Members
        </Typography>
        {isMobile && (
          <IconButton 
            onClick={() => setShowFilters(!showFilters)} 
            color="primary" 
            sx={{ bgcolor: 'rgba(30, 58, 138, 0.1)' }}
          >
            {showFilters ? <CloseIcon /> : <FilterListIcon />}
          </IconButton>
        )}
      </Box>

      <Collapse in={!isMobile || showFilters}>
        <Box className="glass-panel" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, mb: 3 }}>
          <TextField
            label="Search members"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: 'white' }}
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
            <MenuItem value="all">All</MenuItem>
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

  {/* Status Filter */}
  <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} alignItems="center" gap={1}>
    {isMobile ? (
      <FormControl fullWidth size="small">
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          label="Status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    ) : (
      ['active', 'inactive', 'all'].map((key) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        const count = key === 'all' 
          ? members.length 
          : members.filter((m) => (key === 'active' ? m.active === true : m.active === false)).length;
        const selected = statusFilter === key;

        return (
          <Button
            key={key}
            onClick={() => setStatusFilter(key)}
            sx={{
              borderRadius: 20,
              px: 2,
              textTransform: 'none',
              backgroundColor: selected ? (key === 'inactive' ? '#d32f2f' : '#1976d2') : '#fff',
              color: selected ? '#fff' : '#555',
              border: `1px solid ${selected ? (key === 'inactive' ? '#d32f2f' : '#1976d2') : '#ccc'}`,
              '&:hover': {
                backgroundColor: selected ? (key === 'inactive' ? '#b71c1c' : '#1565c0') : '#f9f9f9',
              },
            }}
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
      value={filters[0] || ''}
      onChange={(e) => setFilters([e.target.value])}
      renderValue={(selected) =>
        filterChips.find((c) => c.key === selected)?.label || ''
      }
      MenuProps={{
        PaperProps: {
          sx: { maxHeight: 200 }, // Optional: limits dropdown height on mobile
        },
      }}
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
     onClick={() => handleMemberPDFExport(filteredMembers, genderFilter, '', filters)}

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
          setStatusFilter('active');
        }}
      >
        <ClearIcon />
      </IconButton>
    )}
    </Box>
  </Box>
</Box>
</Collapse>
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
        <>
          {isMobile ? (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {filteredMembers.map((m) => (
                <Card 
                  key={m.member_id} 
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardActionArea onClick={() => handleView(m)} sx={{ p: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar 
                        sx={{ 
                          width: 42, 
                          height: 42, 
                          bgcolor: m.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', 
                          color: m.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                          fontWeight: 800,
                          fontSize: '1rem',
                          borderRadius: 2
                        }}
                      >
                        {m.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box flex={1} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#1E293B" noWrap>
                          {m.name} - {m.relationship || 'Member'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" noWrap sx={{ mt: 0.2 }}>
                          {m.member_id} - {m.address_line2 || 'No Address'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardActionArea>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); handleEdit(m); }}
                    sx={{ position: 'absolute', bottom: 6, right: 8, color: '#6366F1' }}
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          ) : (
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
        </>
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
