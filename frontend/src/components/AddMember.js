import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Checkbox, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, Typography, Button, Stepper, Step, 
  StepLabel, Paper, Fade, Avatar, Stack, Divider
} from '@mui/material';
import API_BASE_URL from '../config';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const steps = ['Basic Details', 'Contact & Status', 'Sacraments'];

const AddMember = () => {
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'family';

  const [activeStep, setActiveStep] = useState(0);
  const [familyId, setFamilyId] = useState(params.get('family_id') || '');
  const [familyHead, setFamilyHead] = useState('');
  
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [relationship, setRelationship] = useState('');
  const [qualification, setQualification] = useState('');
  const [profession, setProfession] = useState('');
  const [residingHere, setResidingHere] = useState(true);
  const [churchGroup, setChurchGroup] = useState('');
  const [active, setActive] = useState(true);
  const [baptismDate, setBaptismDate] = useState('');
  const [baptismPlace, setBaptismPlace] = useState('');
  const [holyCommunionDate, setHolyCommunionDate] = useState('');
  const [holyCommunionPlace, setHolyCommunionPlace] = useState('');
  const [confirmationDate, setConfirmationDate] = useState('');
  const [confirmationPlace, setConfirmationPlace] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [marriagePlace, setMarriagePlace] = useState('');
  const [mobile, setMobile] = useState('');
  const [sex, setSex] = useState('');
  const [headAsMember, setHeadAsMember] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!dob) { setAge(''); return; }
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
    setAge(calculatedAge >= 0 ? calculatedAge.toString() : '');
  }, [dob]);

  useEffect(() => {
    if (!familyId) {
      setFamilyHead('');
      return;
    }
    const fetchFamilyDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/${familyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFamilyHead(res.data.head_name || '');
        setError('');
      } catch {
        setFamilyHead('');
        setError('Family ID not found. Please verify.');
      }
    };
    fetchFamilyDetails();
  }, [familyId, token]);

  const handleToggleHeadAsMember = (checked) => {
    setHeadAsMember(checked);
    if (checked) {
      setName(familyHead);
      setRelationship('Head');
    } else {
      setName('');
      setRelationship('');
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleAddMember = async () => {
    if (!familyId || !name || !dob) {
      setError('Please fill required fields (Family ID, Name, DOB)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/member/add`, {
        family_id: familyId, name, age: age ? parseInt(age) : null, dob,
        marital_status: maritalStatus || null, relationship: relationship || null,
        qualification: qualification || null, profession: profession || null,
        residing_here: residingHere, church_group: churchGroup || null, active: active,
        baptism_date: baptismDate || null, baptism_place: baptismPlace || null,
        holy_communion_date: holyCommunionDate || null, holy_communion_place: holyCommunionPlace || null,
        confirmation_date: confirmationDate || null, confirmation_place: confirmationPlace || null,
        marriage_date: marriageDate || null, marriage_place: marriagePlace || null,
        sex: sex || null, mobile: mobile || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Member ${res.data.name} added successfully!`);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForNext = () => {
    setName(''); setDob(''); setAge(''); setMaritalStatus(''); setRelationship('');
    setQualification(''); setProfession(''); setResidingHere(true); setChurchGroup('');
    setActive(true); setBaptismDate(''); setBaptismPlace(''); setHolyCommunionDate('');
    setHolyCommunionPlace(''); setConfirmationDate(''); setConfirmationPlace('');
    setMarriageDate(''); setMarriagePlace(''); setMobile(''); setSex('');
    setHeadAsMember(false);
    setMessage('');
    setActiveStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (message) {
    return (
      <Fade in timeout={800}>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2, textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: 5, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#10B98115', color: '#10B981', mx: 'auto', mb: 3 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" gutterBottom>Perfect!</Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>{message}</Typography>
            
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<PersonAddRoundedIcon />}
                onClick={resetForNext}
                sx={{ py: 2, borderRadius: 4, fontWeight: 900, bgcolor: '#1E3A8A', boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}
              >
                Add Another Family Member
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/home')}
                sx={{ py: 2, borderRadius: 4, fontWeight: 800, color: '#64748B', borderColor: '#E2E8F0' }}
              >
                Finish & Go to Home
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#1E3A8A', color: '#fff', mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}>
            <PersonAddRoundedIcon />
          </Avatar>
          <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px' }}>
            Add Family Member
          </Typography>
          <Typography variant="body2" color="textSecondary" fontWeight={500}>
            Step {activeStep + 1}: {steps[activeStep]}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5, '& .MuiStepLabel-label': { fontWeight: 800, fontSize: '0.75rem', color: '#94A3B8' } }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          {activeStep === 0 && (
            <Fade in>
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>Basic Details</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Family ID*" value={familyId} onChange={(e) => setFamilyId(e.target.value.toUpperCase())} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Family Head" value={familyHead} InputProps={{ readOnly: true }} fullWidth variant="filled" />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel 
                      control={<Checkbox checked={headAsMember} onChange={(e) => handleToggleHeadAsMember(e.target.checked)} disabled={!familyHead} color="primary" />} 
                      label={<Typography fontWeight={700}>Member is the Family Head</Typography>} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField label="Full Name*" value={name} onChange={(e) => setName(e.target.value)} disabled={headAsMember} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Sex</InputLabel>
                      <Select value={sex} onChange={(e) => setSex(e.target.value)} label="Sex">
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Transgender">Transgender</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Date of Birth*" type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Relationship to Head</InputLabel>
                      <Select value={relationship} onChange={(e) => setRelationship(e.target.value)} label="Relationship" disabled={headAsMember}>
                        {["Head", "Spouse", "Child", "Father", "Mother", "Father in Law", "Mother in Law", "Other"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in>
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>Contact & Status</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Marital Status</InputLabel>
                      <Select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} label="Marital Status">
                        {["Single", "Married", "Divorced", "Widowed"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Church Group / Ministry" value={churchGroup} onChange={(e) => setChurchGroup(e.target.value)} fullWidth placeholder="e.g. Choir, Youth, Vincent De Paul" />
                  </Grid>
                  {role === 'admin' && (
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={3}>
                        <FormControlLabel control={<Checkbox checked={residingHere} onChange={(e) => setResidingHere(e.target.checked)} />} label="Residing in Parish" />
                        <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active Record" />
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 2 && (
            <Fade in>
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>Sacraments</Typography>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}><TextField label="Baptism Date" type="date" value={baptismDate} onChange={(e) => setBaptismDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Baptism Place" value={baptismPlace} onChange={(e) => setBaptismPlace(e.target.value)} fullWidth /></Grid>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Holy Communion Date" type="date" value={holyCommunionDate} onChange={(e) => setHolyCommunionDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Holy Communion Place" value={holyCommunionPlace} onChange={(e) => setHolyCommunionPlace(e.target.value)} fullWidth /></Grid>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Confirmation Date" type="date" value={confirmationDate} onChange={(e) => setConfirmationDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Confirmation Place" value={confirmationPlace} onChange={(e) => setConfirmationPlace(e.target.value)} fullWidth /></Grid>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Marriage Date" type="date" value={marriageDate} onChange={(e) => setMarriageDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Marriage Place" value={marriagePlace} onChange={(e) => setMarriagePlace(e.target.value)} fullWidth /></Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Button 
              startIcon={<ArrowBackRoundedIcon />} 
              disabled={activeStep === 0} 
              onClick={handleBack} 
              sx={{ fontWeight: 800, color: '#64748B' }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleAddMember} 
                disabled={submitting}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1E3A8A' }}
              >
                {submitting ? 'Adding...' : 'Add Member'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                endIcon={<ArrowForwardRoundedIcon />} 
                onClick={handleNext}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1E3A8A' }}
              >
                Continue
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddMember;

const Grid = ({ children, container, item, spacing, xs, sm, md, sx }) => (
  <Box sx={{ 
    ...(container && { display: 'flex', flexWrap: 'wrap', m: spacing ? -(spacing * 4) / 2 : 0 }),
    ...(item && { 
      p: spacing ? (spacing * 4) / 2 : 0, 
      width: xs ? `${(xs / 12) * 100}%` : 'auto',
      ...(sm && { '@media (min-width: 600px)': { width: `${(sm / 12) * 100}%` } })
    }),
    ...sx 
  }}>
    {children}
  </Box>
);

const Alert = ({ children, severity, sx }) => (
  <Box sx={{ p: 2, borderRadius: 2, bgcolor: severity === 'error' ? '#FEF2F2' : '#F0FDF4', color: severity === 'error' ? '#991B1B' : '#166534', border: `1px solid ${severity === 'error' ? '#FEE2E2' : '#DCFCE7'}`, ...sx }}>
    <Typography variant="body2" fontWeight={700}>{children}</Typography>
  </Box>
);
