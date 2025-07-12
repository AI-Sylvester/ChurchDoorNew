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
  Grid
} from '@mui/material';

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

  const token = localStorage.getItem('token');

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
  <Box display="flex" mb={1}>
    <Typography
      variant="body2"
      sx={{ fontWeight: 600, minWidth: 130, color: '#0B3D91' }}
    >
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary">
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
  const colGap = 340;
  let yPos = margin;

  // Title
  doc.setFontSize(20);
  doc.setTextColor('#0B3D91');
  doc.setFont('helvetica', 'bold');
  doc.text('Family Profile', pageWidth / 2, yPos, { align: 'center' });
yPos += 60; // More space after title


  // Helper function to convert image URL to base64
  const toDataURL = (url) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  // Add family picture if exists
  const imgSize = 100;
  let textStartX = margin;
  let detailStartY = yPos;

  if (familyDetails?.family_pic) {
    try {
     const imgUrl = familyDetails.family_pic;
      const imgData = await toDataURL(imgUrl);
      doc.addImage(imgData, 'JPEG', margin, yPos, imgSize, imgSize);
      yPos += imgSize + 15;

      // Head name under picture
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#0B3D91');
      doc.text(`Head: ${familyDetails?.head_name || '-'}`, margin, yPos);
    } catch (err) {
      console.warn('Failed to load family picture for PDF', err);
    }
    textStartX = margin + imgSize + 20;
  } else {
    yPos += 10;
    detailStartY = yPos;
  }

  const familyFields = [
    { label: 'Family ID', value: familyDetails?.family_id || '-' },
    { label: 'Address', value: `${familyDetails?.address_line1 || ''}, ${familyDetails?.address_line2 || ''}` },
    { label: 'City & Pincode', value: `${familyDetails?.city || ''} - ${familyDetails?.pincode || ''}` },
    { label: 'Contact', value: familyDetails?.mobile_number + (familyDetails?.mobile_number2 ? `, ${familyDetails.mobile_number2}` : '') || '-' },
    { label: 'Location', value: familyDetails?.location || '-' },
    { label: 'Native', value: familyDetails?.native || '-' },
    { label: 'Resident From', value: familyDetails?.resident_from ? new Date(familyDetails.resident_from).toLocaleDateString() : '-' },
    { label: 'House Type', value: familyDetails?.house_type || '-' },
    { label: 'Subscription', value: familyDetails?.subscription || '-' },
    { label: 'Anbiyam', value: familyDetails?.anbiyam || '-' },
    { label: 'Cemetery', value: familyDetails?.cemetery || '-' },
    { label: 'Cemetery No.', value: familyDetails?.cemetery_number || '-' },
    { label: 'Active', value: familyDetails?.active ? 'Yes' : 'No' },
    { label: 'Total Members', value: members.length },
  ];

  const col1 = familyFields.slice(0, 7);
  const col2 = familyFields.slice(7, 14);

  // Background box
  const maxLines = Math.max(col1.length, col2.length);
  const boxHeight = maxLines * lineHeight + 20;
  doc.setDrawColor('#0B3D91');
  doc.setFillColor('#E8F0FE');
  doc.roundedRect(textStartX - 10, detailStartY - 15, pageWidth - textStartX - margin + 10, boxHeight, 5, 5, 'F');

  // Render left column
  col1.forEach((item, i) => {
    const y = detailStartY + i * lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#0B3D91');
    doc.text(`${item.label}:`, textStartX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');
    doc.text(`${item.value}`, textStartX + 90, y);
  });

  // Render right column
  col2.forEach((item, i) => {
    const y = detailStartY + i * lineHeight;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor('#0B3D91');
    doc.text(`${item.label}:`, textStartX + colGap, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#000000');
    doc.text(`${item.value}`, textStartX + colGap + 90, y);
  });

  // Prepare for table
  yPos = detailStartY + maxLines * lineHeight + 40;
 const excludedKeys = ['member_id', 'active'];
  const filteredAttributes = memberAttributes.filter(attr => !excludedKeys.includes(attr.key))
  // Members table
  const tableColumnHeaders = filteredAttributes.map(attr => attr.label);
  const tableRows = members.map(member =>
    filteredAttributes.map(attr => {
      const val = member[attr.key];
      if (!val) return '-';
      if (
        ['dob', 'baptism_date', 'holy_communion_date', 'confirmation_date', 'marriage_date'].includes(attr.key)
      ) {
        return new Date(val).toLocaleDateString();
      }
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      return val.toString();
    })
  );

  // Render table
  autoTable(doc, {
    startY: yPos,
    head: [tableColumnHeaders],
    body: tableRows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: '#0B3D91', textColor: '#fff', fontStyle: 'bold' },
    theme: 'striped',
    margin: { left: margin, right: margin },
    tableWidth: pageWidth - margin * 2,
  });

  // Save file with timestamp
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const fileName = `Family_Profile_${familyDetails?.family_id || 'export'}_${formattedDate}.pdf`;
  doc.save(fileName);
};


  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Typography variant="h5" fontWeight={700} color="#0B3D91">
          Family Profile
        </Typography>

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
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select or Type Family ID"
      size="small"
      InputProps={{
        ...params.InputProps,
        type: 'search',
      }}
    />
  )}
  sx={{ minWidth: 200 }}
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
  <Card
    sx={{
      p: 3,
      mb: 4,
      backgroundColor: '#F5F9FF',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}
  >
    <Grid container spacing={3} alignItems="center">
      {/* Avatar Section */}
      <Grid item xs={12} md={3} textAlign="center">
        <Avatar
          src={familyDetails.family_pic || ''}
          sx={{
            width: 120,
            height: 120,
            bgcolor: '#0B3D91',
            fontWeight: 700,
            fontSize: 32,
            border: '3px solid #fff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            mx: 'auto',
          }}
        >
          {!familyDetails.family_pic && '?'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} color="#0B3D91" mt={2}>
          Head: {familyDetails.head_name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Family ID: {familyDetails.family_id}
        </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
    Total Members: {members.length}
  </Typography>
      </Grid>

      {/* Info Section */}
      <Grid item xs={12} md={9}>
        <Grid container spacing={2}>
          {/* Column 1 */}
          <Grid item xs={12} sm={4}>
            <InfoLine label="Address" value={`${familyDetails.address_line1}, ${familyDetails.address_line2}`} />
            <InfoLine label="City & Pincode" value={`${familyDetails.city} - ${familyDetails.pincode}`} />
            <InfoLine label="Contact" value={`${familyDetails.mobile_number}${familyDetails.mobile_number2 ? `, ${familyDetails.mobile_number2}` : ''}`} />
            <InfoLine label="Location" value={familyDetails.location} />
          </Grid>

          {/* Column 2 */}
          <Grid item xs={12} sm={4}>
            <InfoLine label="Native" value={familyDetails.native} />
            <InfoLine
              label="Resident From"
              value={familyDetails.resident_from ? new Date(familyDetails.resident_from).toLocaleDateString() : '-'}
            />
            <InfoLine label="House Type" value={familyDetails.house_type} />
            <InfoLine label="Subscription" value={familyDetails.subscription} />
          </Grid>

          {/* Column 3 */}
          <Grid item xs={12} sm={4}>
            <InfoLine label="Anbiyam" value={familyDetails.anbiyam} />
            <InfoLine label="Cemetery" value={familyDetails.cemetery} />
            <InfoLine label="Cemetery No." value={familyDetails.cemetery_number} />
            <InfoLine label="Active" value={familyDetails.active ? 'Yes' : 'No'} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Card>
)}

    {members.length > 0 && (
  <Box sx={{ overflowX: 'auto', width: '100%' }}>
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
            {memberAttributes.slice(1).map((attr) => (
              <TableCell key={attr.key} sx={{ color: '#fff', fontWeight: 700 }}>
                {attr.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.member_id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{member.member_id}</TableCell>
              {memberAttributes.slice(1).map((attr) => (
                <TableCell key={attr.key}>{formatValue(attr.key, member[attr.key])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
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
    
  );
};

export default FamilyDetailsView;
