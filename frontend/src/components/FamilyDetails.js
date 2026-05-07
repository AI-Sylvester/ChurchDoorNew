import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
   TextField,
   Typography,
  Card,
  CircularProgress,
  Table,Autocomplete ,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const FamilyDetailsView = () => {
  const [familyIds, setFamilyIds] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [familyDetails, setFamilyDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/family/${familyDetails.family_id}`, {
        verification_status: newStatus,
        active: newStatus === 'approved'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFamilyDetails(familyDetails.family_id);
    } catch (err) {
      setError('Failed to update verification status');
    }
  };

  useEffect(() => {
    const fetchFamilyIds = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/ids`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFamilyIds(res.data);
      } catch (err) {
        setError('Failed to load family IDs');
      }
    };

    if (token) fetchFamilyIds();
  }, [token]);

  const fetchFamilyDetails = async (id) => {
    setLoadingFamily(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/family/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFamilyDetails(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load family details');
      setFamilyDetails(null);
    } finally {
      setLoadingFamily(false);
    }
  };

  const fetchFamilyMembers = async (familyId) => {
    setLoadingMembers(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/member/byFamily/${familyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load family members');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleIdChange = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id) {
      await fetchFamilyDetails(id);
      await fetchFamilyMembers(id);
    } else {
      setFamilyDetails(null);
      setMembers([]);
    }
  };

  const memberAttributes = [
    { label: 'Member ID', key: 'member_id' },
    { label: 'Name', key: 'name' },
    { label: 'Age', key: 'age' },
    { label: 'DOB', key: 'dob' },
    { label: 'Sex', key: 'sex' },
    { label: 'Marital Status', key: 'marital_status' },
    { label: 'Relationship', key: 'relationship' },
    { label: 'Qualification', key: 'qualification' },
    { label: 'Profession', key: 'profession' },
    { label: 'Residing Here', key: 'residing_here' },
    { label: 'Church Group', key: 'church_group' },
    { label: 'Active', key: 'active' },
  ];
const InfoLine = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between" mb={1.5} pb={1} sx={{ borderBottom: '1px dashed rgba(0,0,0,0.05)' }}>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', textAlign: 'right', pl: 2 }}>
      {value || '-'}
    </Typography>
  </Box>
);
  const formatValue = (key, value) => {
    if (!value) return '-';
    if (['dob', 'baptism_date', 'holy_communion_date', 'confirmation_date', 'marriage_date'].includes(key)) {
      return new Date(value).toLocaleDateString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };


const exportPDF = async () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const lineHeight = 22;
  let yPos = margin;

  doc.setFontSize(20);
  doc.setTextColor('#0B3D91');
  doc.setFont('helvetica', 'bold');
  doc.text('Family Profile', pageWidth / 2, yPos, { align: 'center' });
  yPos += 40;

  const familyFields = [
    { label: 'Family ID', value: familyDetails?.family_id || '-' },
    { label: 'Address', value: `${familyDetails?.address_line1 || ''}, ${familyDetails?.address_line2 || ''}` },
    { label: 'City & Pincode', value: `${familyDetails?.city || ''} - ${familyDetails?.pincode || ''}` },
    {
      label: 'Contact',
      value:
        familyDetails?.mobile_number +
        (familyDetails?.mobile_number2 ? `, ${familyDetails.mobile_number2}` : '') || '-',
    },
    { label: 'Anbiyam', value: familyDetails?.anbiyam || '-' },
    { label: 'Total Members', value: members.length.toString() },
  ];

  const topY = yPos;
  const totalWidth = pageWidth - margin * 2;
  const leftColumnWidth = (totalWidth * 3) / 4;
  const rightColumnWidth = totalWidth / 4;

  const leftX = margin;
  const rightX = margin + leftColumnWidth + 10; // padding between sections
  const imageWidth = rightColumnWidth - 20;
  const imageHeight = 120;

  // 🔵 LEFT: Family Details (with wrapped values)
  let currentY = topY;

  familyFields.forEach(({ label, value }) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0B3D91');
    doc.text(`${label}:`, leftX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000');

    const wrappedValue = doc.splitTextToSize(value || '-', leftColumnWidth - 100);
    doc.text(wrappedValue, leftX + 100, currentY);

    currentY += lineHeight * wrappedValue.length;
  });

  const detailsHeight = currentY - topY;

  // 🔵 RIGHT: Family Image
  if (familyDetails?.family_pic) {
    try {
      const imgBase64 = await toBase64(familyDetails.family_pic);
      const imageY = topY;

      doc.addImage(imgBase64, 'JPEG', rightX, imageY, imageWidth, imageHeight);
    } catch (err) {
      console.error('Error loading image:', err);
    }
  }

  // 🔽 Adjust yPos after tallest block
  yPos = topY + Math.max(detailsHeight, imageHeight) + 30;

  // 🔽 Member Table
  const memberAttributes = [
    { label: 'Name', key: 'name' },
    { label: 'Age', key: 'age' },
    { label: 'DOB', key: 'dob' },
    { label: 'Sex', key: 'sex' },
    { label: 'Relationship', key: 'relationship' },
    { label: 'Profession', key: 'profession' },
  ];

  const tableColumnHeaders = memberAttributes.map(attr => attr.label);
  const tableRows = members.map(member =>
    memberAttributes.map(attr => {
      const val = member[attr.key];
      if (!val) return '-';
      if (attr.key === 'dob') return new Date(val).toLocaleDateString();
      return val.toString();
    })
  );

  autoTable(doc, {
    startY: yPos,
    head: [tableColumnHeaders],
    body: tableRows,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [11, 61, 145], textColor: [255, 255, 255] },
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
  });

  // 🔽 Save PDF
  const now = new Date();
  const filename = `Family_${familyDetails?.family_id || 'Export'}_${now
    .toISOString()
    .slice(0, 16)
    .replace(/[:T]/g, '-')}.pdf`;

  doc.save(filename);
};

// 📷 Helper: Convert image URL to base64
const toBase64 = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = url;
  });

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', pt: 4, pb: 10 }}>
      <Container maxWidth="lg">
        {/* Floating Search Bar */}
        <Box mb={5} display="flex" justifyContent="center">
          <Autocomplete
            freeSolo
            disableClearable
            options={familyIds}
            value={selectedId}
            onInputChange={(event, newValue) => {
              setSelectedId(newValue);
            }}
            onChange={(event, newValue) => {
              setSelectedId(newValue);
              handleIdChange({ target: { value: newValue } });
            }}
            sx={{ width: { xs: '100%', md: 600 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search by Family ID..."
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 8, 
                    backgroundColor: '#fff', 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)', 
                    '& fieldset': { border: 'none' },
                    px: 1,
                    py: 0.5
                  }
                }}
              />
            )}
          />
        </Box>

      {(loadingFamily || loadingMembers) && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress sx={{ color: '#0B3D91' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
{familyDetails && (
  <Box mb={5}>
    {/* Hero Cover & Avatar */}
    <Box sx={{ position: 'relative', mb: { xs: 8, md: 6 } }}>
      <Box 
        sx={{ 
          height: 180, 
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.2)' 
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -50, 
          left: { xs: '50%', md: 40 },
          transform: { xs: 'translateX(-50%)', md: 'none' },
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3
        }}
      >
        <Avatar
          src={familyDetails.family_pic || ''}
          sx={{
            width: 140,
            height: 140,
            bgcolor: '#0B3D91',
            fontWeight: 700,
            fontSize: 40,
            border: '6px solid #f8fafc',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          {!familyDetails.family_pic && familyDetails.head_name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ display: { xs: 'none', md: 'block' }, pb: 2 }}>
          <Typography variant="h3" fontWeight={800} color="#1E293B">
            {familyDetails.head_name}
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            ID: {familyDetails.family_id}
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Mobile Name (Shown below avatar on mobile) */}
    <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 4 }}>
      <Typography variant="h4" fontWeight={800} color="#1E293B">
        {familyDetails.head_name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
        ID: {familyDetails.family_id}
      </Typography>
    </Box>

    {/* Quick Stat Badges */}
    <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" useFlexGap sx={{ mb: 5, ml: { xs: 0, md: 5 } }}>
      <Box sx={{ px: 2.5, py: 0.8, borderRadius: 50, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', fontWeight: 700, fontSize: '0.875rem' }}>
        {members.length} Members
      </Box>
      <Box sx={{ px: 2.5, py: 0.8, borderRadius: 50, bgcolor: familyDetails.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: familyDetails.active ? '#10B981' : '#EF4444', fontWeight: 700, fontSize: '0.875rem' }}>
        {familyDetails.active ? 'Active' : 'Inactive'}
      </Box>
      {familyDetails.verification_status && (
        <Box sx={{ 
          px: 2.5, py: 0.8, borderRadius: 50, 
          bgcolor: familyDetails.verification_status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                   familyDetails.verification_status === 'recommended' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
          color: familyDetails.verification_status === 'approved' ? '#10B981' : 
                 familyDetails.verification_status === 'recommended' ? '#3B82F6' : '#F59E0B', 
          fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' 
        }}>
          Status: {familyDetails.verification_status.replace('_', ' ')}
        </Box>
      )}
    </Stack>

    {/* Verification Actions */}
    {(role === 'admin' || role === 'incharge') && familyDetails.verification_status !== 'approved' && (
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4, bgcolor: '#FFFBEB', border: '1px solid #FEF3C7', ml: { xs: 0, md: 5 } }} elevation={0}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle1" fontWeight={900} color="#92400E">Verification Action Required</Typography>
            <Typography variant="body2" color="#B45309">
              {familyDetails.verification_status === 'pending_incharge' 
                ? 'As Anbiyam Incharge, please verify the family details and recommend for approval.'
                : 'As Admin, please review the recommended family and grant final approval.'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            {role === 'incharge' && familyDetails.verification_status === 'pending_incharge' && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleStatusUpdate('recommended')}
                sx={{ borderRadius: 3, fontWeight: 900, px: 4, py: 1.5 }}
              >
                Verify & Recommend
              </Button>
            )}
            {role === 'admin' && (familyDetails.verification_status === 'recommended' || familyDetails.verification_status === 'pending_incharge') && (
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => handleStatusUpdate('approved')}
                sx={{ borderRadius: 3, fontWeight: 900, px: 4, py: 1.5, bgcolor: '#10B981' }}
              >
                Approve & Activate
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    )}

    {/* Info Cards */}
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
      {/* Location & Contact Card */}
      <Box flex={1}>
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
          <Typography variant="h6" fontWeight={800} color="#0B3D91" mb={3}>
            Contact & Location
          </Typography>
          <InfoLine label="Address" value={`${familyDetails.address_line1}, ${familyDetails.address_line2}`} />
          <InfoLine label="City & Pincode" value={`${familyDetails.city} - ${familyDetails.pincode}`} />
          <InfoLine label="Contact" value={`${familyDetails.mobile_number}${familyDetails.mobile_number2 ? `, ${familyDetails.mobile_number2}` : ''}`} />
          <InfoLine label="Location" value={familyDetails.location} />
          <InfoLine label="Native" value={familyDetails.native} />
          <InfoLine label="Resident From" value={familyDetails.resident_from ? new Date(familyDetails.resident_from).toLocaleDateString() : '-'} />
        </Card>
      </Box>

      {/* Church & Origin Card */}
      <Box flex={1}>
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
          <Typography variant="h6" fontWeight={800} color="#0B3D91" mb={3}>
            Church Details
          </Typography>
          <InfoLine label="House Type" value={familyDetails.house_type} />
          <InfoLine label="Subscription" value={familyDetails.subscription} />
          <InfoLine label="Anbiyam" value={familyDetails.anbiyam} />
          <InfoLine label="Cemetery" value={familyDetails.cemetery} />
          <InfoLine label="Cemetery No." value={familyDetails.cemetery_number} />
        </Card>
      </Box>
    </Box>
  </Box>
)}

    {/* Members Section Header */}
    {members.length > 0 && (
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2} px={1}>
        <Typography variant="h6" fontWeight={800} color="#1E293B">
          Family Members
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={detailedView}
              onChange={(e) => setDetailedView(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography variant="body2" fontWeight={600} color="text.secondary">Detailed View</Typography>}
        />
      </Box>
    )}

    {members.length > 0 && (
  <>
    {isMobile ? (
      <Stack spacing={2} sx={{ mb: 2 }}>
        {members.map((member) => (
          <Card key={member.member_id} sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #0B3D91' }}>
            <Typography variant="h6" color="#0B3D91" fontWeight={700} mb={0.5}>
              {member.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              ID: {member.member_id}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              {memberAttributes.slice(2).map((attr) => {
                if (!detailedView && !['age', 'relationship'].includes(attr.key)) return null;
                const val = formatValue(attr.key, member[attr.key]);
                if (val === '-') return null; // Hide empty values to keep the card compact
                return (
                  <Box key={attr.key} sx={{ width: 'calc(50% - 6px)' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {attr.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {val}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>
        ))}
      </Stack>
    ) : (
      <Box sx={{ overflowX: 'auto', width: '100%', mb: 2 }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            minWidth: 800, // Ensure horizontal scroll on smaller screens
          }}
        >
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#0B3D91' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Member ID</TableCell>
                {memberAttributes.slice(1).map((attr) => {
                  if (!detailedView && !['name', 'age', 'relationship'].includes(attr.key)) return null;
                  return (
                    <TableCell key={attr.key} sx={{ color: '#fff', fontWeight: 700 }}>
                      {attr.label}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.member_id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{member.member_id}</TableCell>
                  {memberAttributes.slice(1).map((attr) => {
                    if (!detailedView && !['name', 'age', 'relationship'].includes(attr.key)) return null;
                    return (
                      <TableCell key={attr.key}>{formatValue(attr.key, member[attr.key])}</TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )}
  </>
)}
      <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-end' }} mt={2}>
  <button
    onClick={() => exportPDF()}
    disabled={!familyDetails || members.length === 0}
    style={{
      backgroundColor: '#0B3D91',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: 4,
      cursor: familyDetails && members.length ? 'pointer' : 'not-allowed',
      width: 'fit-content',
    }}
  >
    Export to PDF
  </button>
</Box>
      </Container>
    </Box>
    
  );
};

export default FamilyDetailsView;
