import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, CircularProgress, Alert, Paper, Grid, Avatar, 
  Chip, Button, Stack, Fade, IconButton, Dialog
} from '@mui/material';
import API_BASE_URL from '../../config';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NightShelterRoundedIcon from '@mui/icons-material/NightShelterRounded';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    fetchMyFamily();
  }, []);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setDetailOpen(true);
  };

  if (loading) return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mt={15}>
      <CircularProgress thickness={5} size={60} sx={{ color: '#1E3A8A' }} />
      <Typography sx={{ mt: 2, fontWeight: 700, color: '#64748B' }}>Loading family profile...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" sx={{ borderRadius: 4, fontWeight: 600 }}>{error}</Alert>
    </Box>
  );

  if (!data) return (
    <Box sx={{ p: 2, textAlign: 'center', mt: 5 }}>
      <Avatar sx={{ width: 80, height: 80, bgcolor: '#F1F5F9', color: '#94A3B8', mx: 'auto', mb: 2 }}>
        <HomeWorkRoundedIcon sx={{ fontSize: 40 }} />
      </Avatar>
      <Typography variant="h6" fontWeight={800} color="#1E293B">No family record found</Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>You haven't registered your family yet.</Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/add-family')}
        sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', bgcolor: '#1E3A8A' }}
      >
        Register Now
      </Button>
    </Box>
  );

  const { family, members } = data;

  return (
    <Fade in timeout={800}>
      <Box sx={{ maxWidth: 800, mx: 'auto', pb: 10 }}>
        {/* Header Section */}
        <Box sx={{ 
          position: 'relative', 
          pt: 4, pb: 2, px: 1,
          mb: 4,
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.05) 0%, transparent 100%)',
          borderRadius: '0 0 40px 40px'
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar 
              src={family.family_pic} 
              sx={{ 
                width: 110, 
                height: 110, 
                borderRadius: 5, 
                boxShadow: '0 15px 35px rgba(30, 58, 138, 0.2)',
                border: '4px solid #fff'
              }}
            >
              <HomeWorkRoundedIcon sx={{ fontSize: 45 }} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                {family.head_name || 'Family Profile'}
              </Typography>
              <Typography variant="subtitle1" color="primary" fontWeight={800} sx={{ mt: 0.5, opacity: 0.8 }}>
                {family.family_id} • {family.anbiyam}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Chip 
                  label={family.active ? 'Approved' : (family.verification_status === 'recommended' ? 'Vetted' : 'Pending')} 
                  size="small"
                  sx={{ 
                    fontWeight: 900, 
                    bgcolor: family.active ? '#ECFDF5' : (family.verification_status === 'recommended' ? '#EFF6FF' : '#FFF7ED'),
                    color: family.active ? '#10B981' : (family.verification_status === 'recommended' ? '#3B82F6' : '#F59E0B'),
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                />
                {family.active && (
                  <Chip 
                    icon={<LockRoundedIcon sx={{ fontSize: '12px !important' }} />} 
                    label="LOCKED" 
                    size="small" 
                    variant="outlined"
                    sx={{ fontWeight: 900, fontSize: '0.65rem', letterSpacing: '1px' }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ px: 2 }}>
          {/* Main Info Card */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 6, 
            border: '1px solid #F1F5F9',
            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
            mb: 4
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={900} color="#1E293B">Primary Details</Typography>
              {!family.active ? (
                <IconButton 
                  onClick={() => navigate(`/edit-family/${family.family_id}`)}
                  sx={{ bgcolor: '#F1F5F9', color: '#1E3A8A' }}
                >
                  <EditRoundedIcon />
                </IconButton>
              ) : (
                <Button 
                  startIcon={<HistoryRoundedIcon />}
                  size="small"
                  onClick={() => navigate('/raise-update')}
                  sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
                >
                  Request Edit
                </Button>
              )}
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#EFF6FF', color: '#3B82F6', mr: 2, borderRadius: 3 }}>
                      <PhoneRoundedIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Phone</Typography>
                      <Typography fontWeight={700} color="#1E293B">{family.mobile_number}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#F5F3FF', color: '#8B5CF6', mr: 2, borderRadius: 3, mt: 0.5 }}>
                      <LocationOnRoundedIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Location</Typography>
                      <Typography variant="body2" fontWeight={600} color="#475569">
                        {[family.address_line1, family.address_line2].filter(v => v && v !== 'null').join(', ') || 'No Address Provided'}
                        {(family.city && family.city !== 'null') && ` • ${family.city}`}
                        {(family.pincode && family.pincode !== 'null') && ` - ${family.pincode}`}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#FFF7ED', color: '#F59E0B', mr: 2, borderRadius: 3 }}>
                      <CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>Resident Since</Typography>
                      <Typography fontWeight={700} color="#1E293B">{family.resident_from || 'Not Specified'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#ECFDF5', color: '#10B981', mr: 2, borderRadius: 3 }}>
                      <NightShelterRoundedIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>House Type</Typography>
                      <Typography fontWeight={700} color="#1E293B">{family.house_type || 'Owned'}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Members Section */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={900} color="#1E293B">
                Family Members 
                <Chip 
                  label={members.length} 
                  size="small" 
                  sx={{ ml: 1.5, fontWeight: 900, bgcolor: '#1E3A8A', color: '#fff' }} 
                />
              </Typography>
              <Button 
                startIcon={<GroupsRoundedIcon />}
                onClick={() => navigate(`/add-member?family_id=${family.family_id}`)}
                sx={{ 
                  fontWeight: 900, 
                  textTransform: 'none', 
                  borderRadius: 3, 
                  px: 2.5,
                  bgcolor: '#EEF2FF',
                  color: '#4338CA',
                  '&:hover': { bgcolor: '#E0E7FF' }
                }}
              >
                Add Member
              </Button>
            </Stack>

            <Stack spacing={2}>
              {members.map((member, idx) => (
                <Fade in timeout={1000 + (idx * 200)} key={member.id || idx}>
                  <Paper 
                    elevation={0} 
                    onClick={() => handleMemberClick(member)}
                    sx={{ 
                      p: 2, 
                      borderRadius: 4, 
                      border: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: '#F8FAFC', borderColor: '#E2E8F0' },
                      '&:active': { transform: 'scale(0.98)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 48, height: 48, 
                        bgcolor: member.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', 
                        color: member.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                        fontWeight: 900,
                        mr: 2,
                        borderRadius: 3
                      }}>
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={800} color="#1E293B">{member.name}</Typography>
                        <Typography variant="caption" color="textSecondary" fontWeight={600}>
                          {member.relationship} • {member.age} Yrs
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {member.verification_status && member.verification_status !== 'approved' && (
                        <Chip 
                          label={member.verification_status === 'pending_incharge' ? 'Verifying' : 'Vetted'} 
                          size="small"
                          sx={{ 
                            height: 20, 
                            fontSize: '0.6rem', 
                            fontWeight: 900, 
                            textTransform: 'uppercase',
                            bgcolor: member.verification_status === 'pending_incharge' ? '#FFF7ED' : '#EFF6FF',
                            color: member.verification_status === 'pending_incharge' ? '#D97706' : '#2563EB'
                          }} 
                        />
                      )}
                      <ChevronRightRoundedIcon sx={{ color: '#94A3B8' }} />
                    </Box>
                  </Paper>
                </Fade>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Member Detail Dialog */}
        <Dialog 
          open={detailOpen} 
          onClose={() => setDetailOpen(false)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: { borderRadius: 6, p: 1 }
          }}
        >
          {selectedMember && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 3, pt: 2 }}>
                <Avatar sx={{ 
                  width: 80, height: 80, 
                  mx: 'auto', mb: 2,
                  bgcolor: selectedMember.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', 
                  color: selectedMember.sex === 'Male' ? '#3B82F6' : '#F43F5E',
                  fontWeight: 900,
                  fontSize: '2rem',
                  borderRadius: 4,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                }}>
                  {selectedMember.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight={900} color="#1E293B">{selectedMember.name}</Typography>
                <Typography color="primary" fontWeight={800} variant="subtitle2" sx={{ opacity: 0.8 }}>
                  {selectedMember.relationship}
                </Typography>
              </Box>

              <Stack spacing={1.5} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 5 }}>
                <DetailRow label="Member ID" value={selectedMember.member_id} />
                <DetailRow label="Age / Sex" value={`${selectedMember.age} Yrs / ${selectedMember.sex}`} />
                <DetailRow label="Marital Status" value={selectedMember.marital_status} />
                <DetailRow label="Profession" value={selectedMember.profession} />
                <DetailRow label="Qualification" value={selectedMember.qualification} />
                <DetailRow label="Blood Group" value={selectedMember.blood_group} />
                <DetailRow label="Status" value={selectedMember.verification_status?.replace('_', ' ').toUpperCase() || 'APPROVED'} isStatus />
              </Stack>

              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => setDetailOpen(false)}
                sx={{ 
                  mt: 3, 
                  borderRadius: 4, 
                  py: 1.5, 
                  fontWeight: 900, 
                  textTransform: 'none',
                  bgcolor: '#1E293B',
                  boxShadow: '0 10px 20px rgba(30, 41, 59, 0.2)'
                }}
              >
                Close
              </Button>
            </Box>
          )}
        </Dialog>
      </Box>
    </Fade>
  );
};

const DetailRow = ({ label, value, isStatus }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="caption" color="textSecondary" fontWeight={800} sx={{ textTransform: 'uppercase' }}>{label}</Typography>
    {isStatus ? (
      <Chip 
        label={value} 
        size="small" 
        sx={{ 
          height: 20, 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          bgcolor: value === 'APPROVED' ? '#ECFDF5' : '#FFF7ED',
          color: value === 'APPROVED' ? '#10B981' : '#D97706'
        }} 
      />
    ) : (
      <Typography variant="body2" fontWeight={700} color="#334155">{value || '-'}</Typography>
    )}
  </Box>
);

const ChevronRightRoundedIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default MyFamily;
