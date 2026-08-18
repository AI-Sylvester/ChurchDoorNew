import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  TextField,
  Typography,
  Card,
  CircularProgress,
  Autocomplete,
  Paper,
  Alert,
  Avatar,
  Stack,
  InputAdornment,
  Switch,
  FormControlLabel,
  Button,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import API_BASE_URL from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

// Consistent InfoRow used in all detail views
const InfoRow = ({ label, value }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="flex-start"
    py={1.2}
    sx={{ borderBottom: '1px solid #F1F5F9' }}
  >
    <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: '0.65rem', flex: 1, pt: 0.2 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700} color="#1E293B" sx={{ textAlign: 'right', flex: 1.5, pl: 1.5 }}>
      {value || '—'}
    </Typography>
  </Box>
);

const StatusChip = ({ status }) => {
  const config = {
    approved: { label: 'Approved', bg: '#ECFDF5', color: '#10B981' },
    recommended: { label: 'Vetted', bg: '#EFF6FF', color: '#3B82F6' },
    pending_incharge: { label: 'Pending', bg: '#FFF7ED', color: '#F59E0B' },
  };
  const c = config[status] || { label: status || 'Unknown', bg: '#F1F5F9', color: '#64748B' };
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 800, height: 22, fontSize: '0.68rem' }}
    />
  );
};

const FamilyDetailsView = () => {
  const { familyId: urlFamilyId } = useParams();
  const [familyIds, setFamilyIds] = useState([]);
  const [selectedId, setSelectedId] = useState(urlFamilyId || '');
  const [familyDetails, setFamilyDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [updatingMember, setUpdatingMember] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();

  const handleToggleFamilyActive = async () => {
    try {
      const newStatus = !familyDetails.active;
      await axios.put(`${API_BASE_URL}/family/${familyDetails.family_id}`, { active: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFamilyDetails(familyDetails.family_id);
    } catch (err) {
      setError('Failed to toggle family status');
    }
  };

  const handleToggleMemberActive = async (memberId, currentStatus) => {
    try {
      setUpdatingMember(memberId);
      await axios.put(`${API_BASE_URL}/member/${memberId}`, { active: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (familyDetails) await fetchFamilyMembers(familyDetails.family_id);
    } catch (err) {
      setError('Failed to toggle member status');
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/family/${familyDetails.family_id}`, {
        verification_status: newStatus, active: newStatus === 'approved'
      }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchFamilyDetails(familyDetails.family_id);
    } catch (err) {
      setError('Failed to update verification status');
    }
  };

  const handleMemberStatusUpdate = async (memberId, newStatus) => {
    try {
      setUpdatingMember(memberId);
      await axios.put(`${API_BASE_URL}/member/${memberId}`, { verification_status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (familyDetails) {
        await fetchFamilyDetails(familyDetails.family_id);
        await fetchFamilyMembers(familyDetails.family_id);
      }
    } catch (err) {
      setError('Failed to update member status');
    } finally {
      setUpdatingMember(null);
    }
  };

  const fetchFamilyDetails = useCallback(async (id) => {
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
  }, [token]);

  const fetchFamilyMembers = useCallback(async (familyId) => {
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
  }, [token]);

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

  useEffect(() => {
    if (urlFamilyId) {
      setSelectedId(urlFamilyId);
      fetchFamilyDetails(urlFamilyId);
      fetchFamilyMembers(urlFamilyId);
    }
  }, [urlFamilyId, fetchFamilyDetails, fetchFamilyMembers]);

  const handleIdChange = async (id) => {
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

  const formatValue = (key, value) => {
    if (!value && value !== false) return '—';
    if (['dob', 'baptism_date', 'holy_communion_date', 'confirmation_date', 'marriage_date'].includes(key)) {
      return new Date(value).toLocaleDateString();
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
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
      { label: 'Contact', value: familyDetails?.mobile_number + (familyDetails?.mobile_number2 ? `, ${familyDetails.mobile_number2}` : '') || '-' },
      { label: 'Anbiyam', value: familyDetails?.anbiyam || '-' },
      { label: 'Total Members', value: members.length.toString() },
    ];

    const topY = yPos;
    const totalWidth = pageWidth - margin * 2;
    const leftColumnWidth = (totalWidth * 3) / 4;
    const rightColumnWidth = totalWidth / 4;
    const leftX = margin;
    const rightX = margin + leftColumnWidth + 10;
    const imageWidth = rightColumnWidth - 20;
    const imageHeight = 120;

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
    if (familyDetails?.family_pic) {
      try {
        const imgBase64 = await toBase64(familyDetails.family_pic);
        doc.addImage(imgBase64, 'JPEG', rightX, topY, imageWidth, imageHeight);
      } catch (err) {
        console.error('Error loading image:', err);
      }
    }

    yPos = topY + Math.max(detailsHeight, imageHeight) + 30;
    const tableColumnHeaders = ['Name', 'Age', 'DOB', 'Sex', 'Relationship', 'Profession'];
    const tableRows = members.map(member => [
      member.name || '-', member.age || '-',
      member.dob ? new Date(member.dob).toLocaleDateString() : '-',
      member.sex || '-', member.relationship || '-', member.profession || '-'
    ]);

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

    const now = new Date();
    doc.save(`Family_${familyDetails?.family_id || 'Export'}_${now.toISOString().slice(0, 16).replace(/[:T]/g, '-')}.pdf`);
  };

  const toBase64 = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 12 }}>
      <Container maxWidth="lg" sx={{ pt: 2.5, px: { xs: 2, sm: 3 } }}>

        {/* Search */}
        <Box mb={3}>
          <Autocomplete
            freeSolo
            disableClearable
            options={familyIds}
            value={selectedId}
            onInputChange={(event, newValue) => setSelectedId(newValue)}
            onChange={(event, newValue) => { setSelectedId(newValue); handleIdChange(newValue); }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search by Family ID..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            )}
          />
        </Box>

        {(loadingFamily || loadingMembers) && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: '#1E3A8A' }} size={36} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

        {familyDetails && (
          <Box>
            {/* Profile Card */}
            <Card sx={{ mb: 2.5, borderRadius: 4, overflow: 'hidden' }}>
              {/* Banner */}
              <Box
                sx={{
                  height: 100,
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                  position: 'relative',
                }}
              />
              {/* Avatar overlay */}
              <Box sx={{ px: 2.5, pb: 2.5, position: 'relative', mt: '-40px' }}>
                <Box display="flex" alignItems="flex-end" gap={2} mb={1.5}>
                  <Avatar
                    src={familyDetails.family_pic || ''}
                    sx={{
                      width: 84,
                      height: 84,
                      border: '4px solid #fff',
                      borderRadius: 4,
                      bgcolor: '#1E3A8A',
                      fontWeight: 800,
                      fontSize: '2rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      flexShrink: 0,
                    }}
                  >
                    {!familyDetails.family_pic && familyDetails.head_name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box flex={1} pb={0.5}>
                    <Typography variant="h6" fontWeight={900} color="#1E293B" sx={{ lineHeight: 1.1 }}>
                      {familyDetails.head_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" fontWeight={700}>
                      ID: {familyDetails.family_id}
                    </Typography>
                  </Box>
                </Box>

                {/* Status badges + actions */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 6,
                    bgcolor: familyDetails.active ? '#ECFDF5' : '#FFF7ED',
                    color: familyDetails.active ? '#10B981' : '#F59E0B',
                    display: 'flex', alignItems: 'center', gap: 0.5
                  }}>
                    <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.7rem' }}>
                      {familyDetails.active ? 'Active' : 'Inactive'}
                    </Typography>
                    {role === 'admin' && (
                      <Switch
                        size="small"
                        checked={familyDetails.active}
                        onChange={handleToggleFamilyActive}
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </Box>
                  {familyDetails.verification_status && (
                    <StatusChip status={familyDetails.verification_status} />
                  )}
                  <Chip
                    label={`${members.length} Members`}
                    size="small"
                    sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', fontWeight: 700 }}
                  />
                </Stack>

                {/* Edit + Export buttons */}
                <Stack direction="row" spacing={1.5}>
                  {(role === 'admin' || role === 'incharge') && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => navigate(`/edit-family/${familyDetails.family_id}`)}
                      sx={{ borderRadius: 2.5, fontWeight: 700, borderColor: '#E2E8F0', color: '#475569', flex: 1 }}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PictureAsPdfRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={exportPDF}
                    disabled={!familyDetails || members.length === 0}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      bgcolor: '#1E3A8A',
                      flex: 1,
                      '&:hover': { bgcolor: '#172554' },
                    }}
                  >
                    Export PDF
                  </Button>
                </Stack>
              </Box>
            </Card>

            {/* Verification Actions */}
            {(role === 'admin' || role === 'incharge') && familyDetails.verification_status !== 'approved' && (
              <Paper
                elevation={0}
                sx={{ p: 2.5, mb: 2.5, borderRadius: 4, bgcolor: '#FFFBEB', border: '1.5px solid #FEF3C7' }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="#92400E" mb={0.5}>
                  Verification Required
                </Typography>
                <Typography variant="caption" color="#B45309" display="block" mb={2}>
                  {familyDetails.verification_status === 'pending_incharge'
                    ? 'Please review and recommend this family for admin approval.'
                    : 'Review the recommended family and grant final approval.'}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  {role === 'incharge' && familyDetails.verification_status === 'pending_incharge' && (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="small"
                      onClick={() => handleStatusUpdate('recommended')}
                      sx={{ borderRadius: 2.5, fontWeight: 800 }}
                    >
                      Verify & Recommend
                    </Button>
                  )}
                  {role === 'admin' && (familyDetails.verification_status === 'recommended' || familyDetails.verification_status === 'pending_incharge') && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      onClick={() => handleStatusUpdate('approved')}
                      sx={{ borderRadius: 2.5, fontWeight: 800, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                    >
                      Approve & Activate
                    </Button>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Info Panels */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2.5 }}>
              <Card sx={{ flex: 1, p: 2.5, borderRadius: 4 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1E3A8A" mb={1.5}>
                  Contact & Location
                </Typography>
                <InfoRow label="Address" value={[familyDetails.address_line1, familyDetails.address_line2].filter(v => v && v !== 'null').join(', ') || '—'} />
                <InfoRow label="City" value={[familyDetails.city, familyDetails.pincode].filter(v => v && v !== 'null').join(' - ') || '—'} />
                <InfoRow label="Contact" value={[familyDetails.mobile_number, familyDetails.mobile_number2].filter(v => v && v !== 'null').join(', ') || '—'} />
                <InfoRow label="Native" value={familyDetails.native} />
                <InfoRow label="Resident From" value={familyDetails.resident_from ? new Date(familyDetails.resident_from).toLocaleDateString() : '—'} />
              </Card>
              <Card sx={{ flex: 1, p: 2.5, borderRadius: 4 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1E3A8A" mb={1.5}>
                  Church Details
                </Typography>
                <InfoRow label="House Type" value={familyDetails.house_type} />
                <InfoRow label="Subscription" value={familyDetails.subscription} />
                <InfoRow label="Anbiyam" value={familyDetails.anbiyam} />
                <InfoRow label="Cemetery" value={familyDetails.cemetery} />
                <InfoRow label="Cemetery No." value={familyDetails.cemetery_number} />
              </Card>
            </Box>

            {/* Members Section */}
            {members.length > 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} px={0.5}>
                  <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                    Family Members
                    <Chip label={members.length} size="small" sx={{ ml: 1.5, fontWeight: 900, bgcolor: '#1E3A8A', color: '#fff' }} />
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={detailedView}
                        onChange={(e) => setDetailedView(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="caption" fontWeight={700} color="textSecondary">Detailed</Typography>}
                    sx={{ mr: 0 }}
                  />
                </Box>

                {/* Mobile member cards */}
                <Stack spacing={1.5}>
                  {members.map((member) => (
                    <Card
                      key={member.member_id}
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        borderLeft: `3px solid ${member.active ? '#1E3A8A' : '#E2E8F0'}`,
                        opacity: member.active ? 1 : 0.7,
                      }}
                    >
                      {/* Member header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 3,
                              bgcolor: member.sex === 'Male' ? '#EFF6FF' : '#FFF1F2',
                              color: member.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                              fontWeight: 800,
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            {(member.name || '?').charAt(0)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" fontWeight={600}>
                              {member.relationship} • {member.age} Yrs
                            </Typography>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StatusChip status={member.verification_status || 'approved'} />
                          {role === 'admin' && (
                            <Switch
                              size="small"
                              checked={member.active}
                              onChange={() => handleToggleMemberActive(member.member_id, member.active)}
                              disabled={updatingMember === member.member_id}
                            />
                          )}
                        </Stack>
                      </Box>

                      {/* Verification action buttons */}
                      {member.verification_status && member.verification_status !== 'approved' && (
                        <Box display="flex" gap={1} mb={1.5}>
                          {(role === 'incharge' && member.verification_status === 'pending_incharge') && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              fullWidth
                              onClick={() => handleMemberStatusUpdate(member.member_id, 'recommended')}
                              disabled={updatingMember === member.member_id}
                              startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                              sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              {updatingMember === member.member_id ? 'Verifying...' : 'Verify'}
                            </Button>
                          )}
                          {(role === 'admin' && member.verification_status === 'recommended') && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              fullWidth
                              onClick={() => handleMemberStatusUpdate(member.member_id, 'approved')}
                              disabled={updatingMember === member.member_id}
                              startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                              sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.75rem', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                            >
                              {updatingMember === member.member_id ? 'Approving...' : 'Approve'}
                            </Button>
                          )}
                        </Box>
                      )}

                      {/* Member detail fields */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                        {memberAttributes.slice(2, -1).map((attr) => {
                          if (!detailedView && !['age', 'relationship', 'sex'].includes(attr.key)) return null;
                          const val = formatValue(attr.key, member[attr.key]);
                          if (val === '—') return null;
                          return (
                            <Box key={attr.key} sx={{ width: '50%', py: 0.6, pr: 1 }}>
                              <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                {attr.label}
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color="#334155">
                                {val}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default FamilyDetailsView;
