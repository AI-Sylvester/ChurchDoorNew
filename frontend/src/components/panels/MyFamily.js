import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Alert, Paper, Avatar,
  Chip, Button, Stack, Fade, IconButton, Dialog, Divider
} from '@mui/material';
import API_BASE_URL from '../../config';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NightShelterRoundedIcon from '@mui/icons-material/NightShelterRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';

// Shared InfoRow — same pattern used in FamilyDetails
const InfoRow = ({ label, value }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="flex-start"
    py={1.2}
    sx={{ borderBottom: '1px solid #F1F5F9' }}
  >
    <Typography
      variant="caption"
      fontWeight={700}
      color="textSecondary"
      sx={{ textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: '0.62rem', flex: 1, pt: 0.2 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={700}
      color="#1E293B"
      sx={{ textAlign: 'right', flex: 1.5, pl: 1.5 }}
    >
      {value || '—'}
    </Typography>
  </Box>
);

const MyFamily = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const navigate = useNavigate();

  const fetchMyFamily = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/family-user/my-family`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load family details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyFamily(); }, []);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setDetailOpen(true);
  };

  if (loading) return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mt={12}>
      <CircularProgress thickness={5} size={48} sx={{ color: '#1E3A8A' }} />
      <Typography sx={{ mt: 2, fontWeight: 600, color: '#94A3B8', fontSize: '0.875rem' }}>
        Loading family profile...
      </Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" sx={{ borderRadius: 3, fontWeight: 600 }}>{error}</Alert>
    </Box>
  );

  if (!data) return (
    <Box sx={{ p: 2.5, textAlign: 'center', mt: 6 }}>
      <Avatar sx={{ width: 80, height: 80, bgcolor: '#F1F5F9', color: '#94A3B8', mx: 'auto', mb: 2, borderRadius: 4 }}>
        <HomeWorkRoundedIcon sx={{ fontSize: 36 }} />
      </Avatar>
      <Typography variant="h6" fontWeight={800} color="#1E293B" mb={0.5}>No family record found</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>You haven't registered your family yet.</Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/add-family')}
        sx={{ borderRadius: 3, fontWeight: 800, bgcolor: '#1E3A8A', textTransform: 'none', px: 4 }}
      >
        Register Now
      </Button>
    </Box>
  );

  const { family, members } = data;

  const statusInfo = family.active
    ? { label: 'Approved', bg: '#ECFDF5', color: '#10B981' }
    : family.verification_status === 'recommended'
    ? { label: 'Vetted', bg: '#EFF6FF', color: '#3B82F6' }
    : { label: 'Pending', bg: '#FFF7ED', color: '#F59E0B' };

  return (
    <Fade in timeout={500}>
      <Box sx={{ pb: 12 }}>
        {/* Profile Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            pt: 3,
            pb: 5,
            px: 2.5,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <Stack direction="row" alignItems="center" spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              src={family.family_pic}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                border: '3px solid rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            >
              <HomeWorkRoundedIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={900} color="#fff" sx={{ lineHeight: 1.1, mb: 0.3 }}>
                {family.head_name || 'Family Profile'}
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.75)" fontWeight={700} display="block">
                {family.family_id} • {family.anbiyam}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip
                  label={statusInfo.label}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, fontSize: '0.65rem', backdropFilter: 'blur(8px)' }}
                />
                {family.active && (
                  <Chip
                    icon={<LockRoundedIcon sx={{ fontSize: '11px !important', color: 'rgba(255,255,255,0.7) !important' }} />}
                    label="Locked"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.62rem' }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 2.5, mt: -3 }}>
          {/* Primary Details Card */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: '1px solid #F1F5F9',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              mb: 2.5,
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <Box
              sx={{
                px: 2.5,
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #F8FAFC',
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                Primary Details
              </Typography>
              {!family.active ? (
                <IconButton
                  size="small"
                  onClick={() => navigate(`/edit-family/${family.family_id}`)}
                  sx={{ bgcolor: '#F1F5F9', color: '#1E3A8A', width: 32, height: 32 }}
                >
                  <EditRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              ) : (
                <Button
                  startIcon={<HistoryRoundedIcon sx={{ fontSize: 14 }} />}
                  size="small"
                  onClick={() => navigate('/raise-update')}
                  sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2.5, fontSize: '0.78rem' }}
                >
                  Request Edit
                </Button>
              )}
            </Box>

            {/* Info rows */}
            <Box sx={{ px: 2.5, py: 1 }}>
              <Box display="flex" alignItems="center" gap={2} py={1.5} sx={{ borderBottom: '1px solid #F1F5F9' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#EFF6FF', color: '#3B82F6', borderRadius: 2 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Phone</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1E293B">{family.mobile_number || '—'}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={2} py={1.5} sx={{ borderBottom: '1px solid #F1F5F9' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#F5F3FF', color: '#8B5CF6', borderRadius: 2, mt: 0.3 }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Address</Typography>
                  <Typography variant="body2" fontWeight={600} color="#475569">
                    {[family.address_line1, family.address_line2].filter(v => v && v !== 'null').join(', ') || 'No Address'}
                    {(family.city && family.city !== 'null') && ` • ${family.city}`}
                    {(family.pincode && family.pincode !== 'null') && ` - ${family.pincode}`}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} py={1.5} sx={{ borderBottom: '1px solid #F1F5F9' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#FFF7ED', color: '#F59E0B', borderRadius: 2 }}>
                  <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Resident Since</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1E293B">{family.resident_from || 'Not Specified'}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} py={1.5}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#ECFDF5', color: '#10B981', borderRadius: 2 }}>
                  <NightShelterRoundedIcon sx={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight={700} sx={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>House Type</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1E293B">{family.house_type || 'Owned'}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Members Section */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle1" fontWeight={800} color="#1E293B">
                Members
                <Chip label={members.length} size="small" sx={{ ml: 1.5, fontWeight: 900, bgcolor: '#1E3A8A', color: '#fff' }} />
              </Typography>
              <Button
                startIcon={<GroupsRoundedIcon sx={{ fontSize: 15 }} />}
                size="small"
                onClick={() => navigate(`/add-member?family_id=${family.family_id}`)}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2.5,
                  px: 2,
                  bgcolor: '#EEF2FF',
                  color: '#4338CA',
                  fontSize: '0.78rem',
                  '&:hover': { bgcolor: '#E0E7FF' },
                }}
              >
                Add
              </Button>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
              {members.map((member, idx) => (
                <Fade in timeout={800 + idx * 150} key={member.id || idx}>
                  <Box>
                    <Box
                      onClick={() => handleMemberClick(member)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        gap: 2,
                        cursor: 'pointer',
                        '&:active': { bgcolor: '#F8FAFC' },
                        '&:hover': { bgcolor: '#FAFBFC' },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: 3,
                          bgcolor: member.sex === 'Male' ? '#EFF6FF' : '#FFF1F2',
                          color: member.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight={600}>
                          {member.relationship} • {member.age} Yrs
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {member.verification_status && member.verification_status !== 'approved' && (
                          <Chip
                            label={member.verification_status === 'pending_incharge' ? 'Verifying' : 'Vetted'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              bgcolor: member.verification_status === 'pending_incharge' ? '#FFF7ED' : '#EFF6FF',
                              color: member.verification_status === 'pending_incharge' ? '#D97706' : '#2563EB',
                            }}
                          />
                        )}
                        <ChevronRightRoundedIcon sx={{ color: '#CBD5E1', fontSize: 18 }} />
                      </Box>
                    </Box>
                    {idx < members.length - 1 && <Divider sx={{ ml: 9, opacity: 0.5 }} />}
                  </Box>
                </Fade>
              ))}
            </Paper>
          </Box>
        </Box>

        {/* Member Detail Dialog */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 5, overflow: 'hidden', m: 2 } }}
        >
          {selectedMember && (
            <Box>
              {/* Dialog gradient header */}
              <Box
                sx={{
                  background: selectedMember.sex === 'Male'
                    ? 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)'
                    : 'linear-gradient(135deg, #9D174D 0%, #F43F5E 100%)',
                  px: 3,
                  pt: 3,
                  pb: 4,
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={() => setDetailOpen(false)}
                  size="small"
                  sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    mx: 'auto',
                    mb: 1.5,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: '1.8rem',
                    borderRadius: 4,
                    border: '3px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {selectedMember.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight={900} color="#fff">
                  {selectedMember.name}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.8)" fontWeight={700}>
                  {selectedMember.relationship}
                </Typography>
              </Box>

              {/* Detail rows */}
              <Box sx={{ px: 2.5, py: 1.5, mt: -2, bgcolor: '#fff', borderRadius: '16px 16px 0 0', position: 'relative' }}>
                <InfoRow label="Member ID" value={selectedMember.member_id} />
                <InfoRow label="Age / Sex" value={`${selectedMember.age} Yrs / ${selectedMember.sex}`} />
                <InfoRow label="Marital Status" value={selectedMember.marital_status} />
                <InfoRow label="Profession" value={selectedMember.profession} />
                <InfoRow label="Qualification" value={selectedMember.qualification} />
                <InfoRow label="Blood Group" value={selectedMember.blood_group} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1.2}
                >
                  <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: '0.62rem' }}>
                    Status
                  </Typography>
                  <Chip
                    label={(selectedMember.verification_status || 'approved').replace('_', ' ').toUpperCase()}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: (selectedMember.verification_status === 'approved' || !selectedMember.verification_status) ? '#ECFDF5' : '#FFF7ED',
                      color: (selectedMember.verification_status === 'approved' || !selectedMember.verification_status) ? '#10B981' : '#D97706',
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setDetailOpen(false)}
                  sx={{
                    mt: 2,
                    mb: 1.5,
                    borderRadius: 3,
                    py: 1.3,
                    fontWeight: 900,
                    bgcolor: '#1E293B',
                    '&:hover': { bgcolor: '#0F172A' },
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
};

export default MyFamily;
