import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
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
  TextField,
  CircularProgress,
  FormControlLabel,
  Switch,
  Avatar,
  Tabs,
  Tab,
  Stack,

  useMediaQuery,
  useTheme,
  Card,
  CardActionArea,
  Collapse,
  Autocomplete,
} from '@mui/material';
import API_BASE_URL from '../config';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SearchIcon from '@mui/icons-material/Search';
import RoomIcon from '@mui/icons-material/Room';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import MapSelector from './Mapselector'; // adjust path if needed
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';



const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // ✅ Added this line
  const [showFilters, setShowFilters] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
const [showEditMap, setShowEditMap] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [editData, setEditData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [anbiyamList, setAnbiyamList] = useState([]);
  const token = localStorage.getItem('token');
  const [page, setPage] = useState(1);

  const limit = 10000; // Large limit to show all families

  useEffect(() => {
    const fetchAnbiyams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/anbiyam`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnbiyamList(res.data);
      } catch (err) {
        console.error('Failed to load anbiyams');
      }
    };
    fetchAnbiyams();
  }, [token]);

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        activeTab === 'inactive'
          ? `${API_BASE_URL}/family/list-inactive`
          : `${API_BASE_URL}/family/list`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, search: searchQuery }
      });
      setFamilies(res.data.families || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load family records');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, page, searchQuery, limit]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const handleSearch = () => {
    setPage(1); // Reset to page 1 on new search
    fetchFamilies();
  };



const handleView = async (familyId) => {
  try {
    let url;
    if (activeTab === 'inactive') {
      url = `${API_BASE_URL}/family/list-inactive/${familyId}`;
    } else {
      url = `${API_BASE_URL}/family/${familyId}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSelectedFamily(res.data);
    setViewOpen(true);
  } catch (err) {
    console.error('Error fetching family details:', err);
    setError('Failed to fetch family details');
  }
};
const handleEdit = async (familyId) => {
  try {
    let url;
    if (activeTab === 'inactive') {
      url = `${API_BASE_URL}/family/list-inactive/${familyId}`;
    } else {
      url = `${API_BASE_URL}/family/byFamilyId/${familyId}`;
    }

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEditData(res.data);
    setEditFile(null);
    setEditOpen(true);
  } catch (err) {
    console.error(err);
    setError('Failed to fetch family details');
  }
};

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(editData).forEach(([key, val]) => {
        formData.append(key, key === 'active' ? (val ? 'true' : 'false') : val || '');
      });

      if (editFile) {
        formData.append('family_pic', editFile);
      }

      await axios.put(`${API_BASE_URL}/family/${editData.family_id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setEditOpen(false);
      fetchFamilies();
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to update family');
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = (family_pic) => {
    if (family_pic) {
     setSelectedImage(family_pic);
      setImageOpen(true);
    }
  };

  const filteredFamilies = useMemo(() => {
    return [...families].sort((a, b) => 
      (a.head_name || '').toLowerCase().localeCompare((b.head_name || '').toLowerCase())
    );
  }, [families]);


const exportPDF = async (filteredFamiliesRaw) => {
  const filteredFamilies = Array.isArray(filteredFamiliesRaw) ? filteredFamiliesRaw : [];

  const doc = new jsPDF('p', 'pt', 'a4');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor('#0B3D91');
  doc.text('Family Records', 220, 30); // Approx. centered

  // Table
  autoTable(doc, {
    head: [['Family ID', 'Name', 'Mobile 1', 'Mobile 2', 'Anbiyam', 'Address']],
    body: filteredFamilies.map(fam => [
      fam.family_id ?? '',
      fam.head_name ?? '',
      fam.mobile_number ?? '',
      fam.mobile_number2 ?? '',
      fam.anbiyam ?? '',
      [fam.address_line1, fam.address_line2, fam.city, fam.pincode].filter(Boolean).join(', ')
    ]),
    styles: {
      fontSize: 10,
      textColor: [0, 0, 0],
      halign: 'left',
      cellPadding: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [11, 61, 145],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 249, 255],
    },
    startY: 50,
    margin: { top: 40, left: 20, right: 20 },
    theme: 'grid',
  });

  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 16);
  const fileName = `family-records-${timestamp}.pdf`;

  const base64Data = doc.output('datauristring').split(',')[1];

  if (Capacitor.getPlatform() === 'web') {
    const link = document.createElement('a');
    link.href = doc.output('bloburl');
    link.download = fileName;
    link.click();
  } else {
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        encoding: Encoding.BASE64,
      });
      alert('✅ PDF saved successfully!');
    } catch (error) {
      console.error('❌ Error saving PDF:', error);
      alert('Error saving PDF on device.');
    }
  }
};
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary">
          Family Records
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
<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
  <TextField
    label="Search Families"
    variant="outlined"
    size="medium"
    fullWidth
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search by name, ID, city, mobile..."
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    }}
    sx={{ backgroundColor: 'white', borderRadius: 1 }}
  />
  <Button
    variant="contained"
    color="primary"
    onClick={handleSearch}
    sx={{ minWidth: { xs: '100%', sm: '60px' }, height: '56px' }}
  >
    <SearchIcon />
  </Button>
 <Button
  variant="outlined"
  color="secondary"
  onClick={() => exportPDF(filteredFamilies)}
  sx={{ minWidth: { xs: '100%', sm: '60px' }, height: '56px' }}
>
  <PrintIcon />
</Button>
</Stack>
</Box>
</Collapse>

    <Tabs
  value={activeTab}
  onChange={(e, newValue) => {
    setActiveTab(newValue);
    setPage(1); // reset to page 1 on tab change
  }}
  sx={{ mb: 3 }}
  indicatorColor="secondary"
  textColor="secondary"
  variant="fullWidth"
>
  <Tab label="Active" value="active" />
  <Tab label="Inactive" value="inactive" />
</Tabs>
  

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : filteredFamilies.length === 0 ? (
        <Box className="glass-panel" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="textSecondary">No family records found.</Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={2} sx={{ mb: 3 }}>
              {filteredFamilies.map((fam) => (
                <Card 
                  key={fam.family_id} 
                  sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                    position: 'relative',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <CardActionArea onClick={() => handleView(fam.family_id)} sx={{ p: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        variant="rounded"
                        src={fam.family_pic}
                        sx={{ width: 45, height: 45, bgcolor: 'grey.100', borderRadius: 2 }}
                      >
                        {!fam.family_pic && fam.head_name.charAt(0)}
                      </Avatar>
                      <Box flex={1} sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#1E293B" noWrap>
                          {fam.head_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" noWrap>
                          {fam.address_line2 || 'No Address'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.2}>
                          <Typography variant="caption" color="textSecondary">
                            ID: {fam.family_id}
                          </Typography>
                          <Box sx={{
                            px: 1, py: 0.1, borderRadius: 1, display: 'inline-block',
                            bgcolor: fam.active ? '#ECFDF5' : '#FEF2F2',
                            color: fam.active ? '#10B981' : '#EF4444',
                            fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase'
                          }}>
                            {fam.active ? 'Active' : 'Inactive'}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardActionArea>
                  <IconButton
                    onClick={(e) => { e.stopPropagation(); handleEdit(fam.family_id); }}
                    sx={{ position: 'absolute', bottom: 6, right: 8, color: '#6366F1' }}
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Family ID</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Head Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mobile</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Anbiyam</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Active</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Picture</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFamilies.map((fam) => (
                  <TableRow key={fam.family_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell fontWeight="500">{fam.family_id}</TableCell>
                    <TableCell>{fam.head_name}</TableCell>
                    <TableCell>{fam.city}</TableCell>
                    <TableCell>{fam.mobile_number}</TableCell>
                    <TableCell>{fam.anbiyam || '-'}</TableCell>
                    <TableCell>
                       <Box sx={{
                           px: 1.5, py: 0.5, borderRadius: 50, display: 'inline-block',
                           bgcolor: fam.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                           color: fam.active ? '#10B981' : '#EF4444',
                           fontWeight: 600, fontSize: '0.8rem'
                       }}>
                         {fam.active ? 'Yes' : 'No'}
                       </Box>
                    </TableCell>
                    <TableCell>
                      {fam.family_pic ? (
                        <Avatar
                          variant="rounded"
                          src={fam.family_pic}
                          alt={`${fam.head_name}`}
                          sx={{ width: 40, height: 40, cursor: 'pointer', boxShadow: 1 }}
                          onClick={() => handleImageClick(fam.family_pic)}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>-</Avatar>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button size="small" variant="outlined" onClick={() => handleView(fam.family_id)}>View</Button>
                        <Button size="small" variant="contained" color="secondary" onClick={() => handleEdit(fam.family_id)}>Edit</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}

        </>
      )}

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Family Details (Read-only)</DialogTitle>
        <DialogContent dividers>
          {selectedFamily ? (
            Object.entries(selectedFamily).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" component="span" sx={{ textTransform: 'capitalize', mr: 1 }}>
                  {key.replace(/_/g, ' ')}:
                </Typography>
                <Typography component="span">{value === null || value === '' ? '-' : value.toString()}</Typography>
              </Box>
            ))
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Family Details</DialogTitle>
        <DialogContent dividers>
          {editData ? (
            <Box component="form" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxHeight: '70vh', overflowY: 'auto' }} noValidate autoComplete="off">
              <TextField label="Head Name" value={editData.head_name || ''} onChange={(e) => handleEditChange('head_name', e.target.value)} fullWidth required />
              <TextField label="Address Line 1" value={editData.address_line1 || ''} onChange={(e) => handleEditChange('address_line1', e.target.value)} fullWidth />
              <TextField label="Address Line 2" value={editData.address_line2 || ''} onChange={(e) => handleEditChange('address_line2', e.target.value)} fullWidth />
              <TextField label="City" value={editData.city || ''} onChange={(e) => handleEditChange('city', e.target.value)} fullWidth required />
              <TextField label="Pincode" value={editData.pincode || ''} onChange={(e) => handleEditChange('pincode', e.target.value)} fullWidth />
              <TextField label="Mobile Number" value={editData.mobile_number || ''} onChange={(e) => handleEditChange('mobile_number', e.target.value)} fullWidth required />
              <TextField label="Mobile Number 2" value={editData.mobile_number2 || ''} onChange={(e) => handleEditChange('mobile_number2', e.target.value)} fullWidth />
              <TextField label="Cemetery" value={editData.cemetery || ''} onChange={(e) => handleEditChange('cemetery', e.target.value)} fullWidth />
              <TextField label="Native" value={editData.native || ''} onChange={(e) => handleEditChange('native', e.target.value)} fullWidth />
              <TextField label="Resident From" value={editData.resident_from || ''} onChange={(e) => handleEditChange('resident_from', e.target.value)} fullWidth />
              <TextField label="House Type" value={editData.house_type || ''} onChange={(e) => handleEditChange('house_type', e.target.value)} fullWidth />
              <TextField label="Subscription" value={editData.subscription || ''} onChange={(e) => handleEditChange('subscription', e.target.value)} fullWidth />
              <FormControlLabel control={<Switch checked={!!editData.active} onChange={(e) => handleEditChange('active', e.target.checked)} />} label="Active" sx={{ gridColumn: 'span 2' }} />
             <TextField
  label="Location"
  value={editData.location || ''}
  onChange={(e) => handleEditChange('location', e.target.value)}
  fullWidth
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShowEditMap((prev) => !prev)}>
          <RoomIcon color="primary" />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>{showEditMap && (
  <Box sx={{ gridColumn: 'span 2', height: 250, mt: 1 }}>
    <MapSelector
      value={editData?.location}
      onChange={(loc) => {
        handleEditChange('location', loc);
        setShowEditMap(false); // close after selection
      }}
    />
  </Box>
)}
              <Autocomplete
                fullWidth
                options={anbiyamList.map((item) => item.name)}
                value={editData.anbiyam || null}
                onChange={(event, newValue) => {
                  handleEditChange('anbiyam', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Anbiyam" />
                )}
                freeSolo
              />
              <TextField label="Cemetery Number" value={editData.cemetery_number || ''} onChange={(e) => handleEditChange('cemetery_number', e.target.value)} fullWidth />
              <TextField label="Old Card Number" value={editData.old_card_number || ''} onChange={(e) => handleEditChange('old_card_number', e.target.value)} fullWidth />

             <Box sx={{ gridColumn: 'span 2', textAlign: 'center' }}>
  {editFile ? (
    <img
      src={URL.createObjectURL(editFile)}
      alt="Selected Preview"
      style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
    />
  ) : editData.family_pic ? (
    <img
      src={
        editData.family_pic.startsWith('http')
          ? editData.family_pic
          : `${API_BASE_URL}/uploads/${editData.family_pic}`
      }
      alt="Current Family Pic"
      style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
    />
  ) : (
    <Typography color="text.secondary">No Image Available</Typography>
  )}
</Box>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setEditFile(e.target.files[0]);
                  }
                }}
                style={{ gridColumn: 'span 2' }}
              />
            </Box>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageOpen} onClose={() => setImageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Family Picture</DialogTitle>
        <DialogContent dividers sx={{ textAlign: 'center' }}>
        {selectedImage ? (
  <img
    src={selectedImage}
    alt="Family"
    style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
  />
) : (
  <Typography>No Image Available</Typography>
)}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FamilyList;
