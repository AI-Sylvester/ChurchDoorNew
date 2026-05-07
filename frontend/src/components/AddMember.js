import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Checkbox, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, Typography, Button, Stepper, Step, 
  StepLabel, Paper, Fade, Avatar, Stack, Divider, Grid, Alert, CircularProgress
} from '@mui/material';
import API_BASE_URL from '../config';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const steps = ['Basic Details', 'Contact & Profession', 'Sacraments'];

const AddMember = () => {
  const params = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || 'family').toLowerCase();

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

  const handleNext = () => {
    if (activeStep === 0) {
      if (!familyId) { setError('Family ID is required'); return; }
      if (!name) { setError('Member Name is required'); return; }
      if (!dob) { setError('Date of Birth is required'); return; }
      if (!sex) { setError('Sex is required'); return; }
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleAddMember = async () => {
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
          <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#10B98115', color: '#10B981', mx: 'auto', mb: 3 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} color="#1E293B" gutterBottom sx={{ letterSpacing: '-1px' }}>Member Added!</Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>{message}</Typography>
            
            <Stack spacing={2}>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<PersonAddRoundedIcon />}
                onClick={resetForNext}
                sx={{ py: 2, borderRadius: 4, fontWeight: 900, bgcolor: '#1E3A8A', boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}
              >
                Add Another Member
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/home')}
                sx={{ py: 2, borderRadius: 4, fontWeight: 800, color: '#64748B', borderColor: '#E2E8F0' }}
              >
                Finish & Go Home
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F1F5F9', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#1E3A8A', color: '#fff', mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(30, 58, 138, 0.2)' }}>
            <PersonAddRoundedIcon />
          </Avatar>
          <Typography variant="h4" fontWeight={900} color="#1E293B" sx={{ letterSpacing: '-1.5px', mb: 0.5 }}>
            Family Member
          </Typography>
          <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
            Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, '& .MuiStepLabel-label': { fontWeight: 800, fontSize: '0.7rem' } }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {error && <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 4, fontWeight: 700 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
          {activeStep === 0 && (
            <Fade in>
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>Basic Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Family ID*" value={familyId} onChange={(e) => setFamilyId(e.target.value.toUpperCase())} fullWidth placeholder="FAM0000000" />
                  </Grid>
                  {familyHead && (
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC', borderStyle: 'dashed', borderRadius: 3 }}>
                         <Typography variant="caption" color="textSecondary" fontWeight={800}>REGISTERING FOR FAMILY HEAD</Typography>
                         <Typography variant="h6" fontWeight={900} color="#1E3A8A">{familyHead}</Typography>
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <FormControlLabel 
                      control={<Checkbox checked={headAsMember} onChange={(e) => handleToggleHeadAsMember(e.target.checked)} disabled={!familyHead} />} 
                      label={<Typography fontWeight={800} variant="body2">This member is the Family Head</Typography>} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Full Name*" value={name} onChange={(e) => setName(e.target.value)} disabled={headAsMember} fullWidth />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sex*</InputLabel>
                      <Select value={sex} onChange={(e) => setSex(e.target.value)} label="Sex*">
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Transgender">Transgender</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} fullWidth disabled={headAsMember} placeholder="e.g. Spouse, Child" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Date of Birth*" type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeStep === 1 && (
            <Fade in>
              <Box>
                <Typography variant="subtitle2" color="primary" fontWeight={800} sx={{ mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>Contact & Profession</Typography>
                <Grid container spacing={2}>
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
                  <Grid item xs={12}>
                    <TextField label="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} fullWidth placeholder="e.g. B.Tech, Ph.D" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Church Group / Ministry" value={churchGroup} onChange={(e) => setChurchGroup(e.target.value)} fullWidth placeholder="e.g. Choir, Youth League" />
                  </Grid>
                  {role === 'admin' && (
                    <Grid item xs={12}>
                       <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <FormControlLabel control={<Checkbox checked={residingHere} onChange={(e) => setResidingHere(e.target.checked)} />} label={<Typography variant="body2" fontWeight={700}>Residing here</Typography>} />
                          <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label={<Typography variant="body2" fontWeight={700}>Active record</Typography>} />
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
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Baptism Date" type="date" value={baptismDate} onChange={(e) => setBaptismDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Place" value={baptismPlace} onChange={(e) => setBaptismPlace(e.target.value)} fullWidth /></Grid>
                  
                  <Grid item xs={12}><Divider sx={{ my: 1, opacity: 0.5 }} /></Grid>
                  
                  <Grid item xs={6}><TextField label="Holy Com. Date" type="date" value={holyCommunionDate} onChange={(e) => setHolyCommunionDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Place" value={holyCommunionPlace} onChange={(e) => setHolyCommunionPlace(e.target.value)} fullWidth /></Grid>
                  
                  <Grid item xs={12}><Divider sx={{ my: 1, opacity: 0.5 }} /></Grid>
                  
                  <Grid item xs={6}><TextField label="Confirmation Date" type="date" value={confirmationDate} onChange={(e) => setConfirmationDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Place" value={confirmationPlace} onChange={(e) => setConfirmationPlace(e.target.value)} fullWidth /></Grid>
                  
                  <Grid item xs={12}><Divider sx={{ my: 1, opacity: 0.5 }} /></Grid>
                  
                  <Grid item xs={6}><TextField label="Marriage Date" type="date" value={marriageDate} onChange={(e) => setMarriageDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Place" value={marriagePlace} onChange={(e) => setMarriagePlace(e.target.value)} fullWidth /></Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Button 
              startIcon={<ArrowBackRoundedIcon />} 
              disabled={activeStep === 0} 
              onClick={handleBack} 
              sx={{ fontWeight: 800, color: '#64748B', textTransform: 'none' }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleAddMember} 
                disabled={submitting}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1E3A8A', textTransform: 'none' }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Member'}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                endIcon={<ArrowForwardRoundedIcon />} 
                onClick={handleNext}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 900, bgcolor: '#1E3A8A', textTransform: 'none' }}
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
