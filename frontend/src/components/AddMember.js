import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Checkbox, FormControlLabel, FormControl,
  InputLabel, Select, MenuItem, Typography, Button, Stepper, Step, StepLabel, Paper
} from '@mui/material';
import API_BASE_URL from '../config';

const steps = ['Basic Details', 'Contact & Status', 'Sacraments'];

const AddMember = () => {
  const params = new URLSearchParams(window.location.search);
  const [activeStep, setActiveStep] = useState(0);

  // Form States
  const [familyId, setFamilyId] = useState(params.get('family_id') || '');
  const [familyHead, setFamilyHead] = useState('');
  const [familyMobile, setFamilyMobile] = useState('');
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
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'family';
  const navigate = useNavigate();

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
      setFamilyHead(''); setFamilyMobile('');
      if (headAsMember) { setName(''); setHeadAsMember(false); }
      return;
    }
    const fetchFamilyDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/family/${familyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFamilyHead(res.data.head_name || '');
        setFamilyMobile(res.data.mobile_number || '');
        if (headAsMember) {
          setName(res.data.head_name || '');
          setRelationship('Head');
        }
        setError('');
      } catch {
        setFamilyHead(''); setFamilyMobile('');
        setError('Family not found');
        setName('');
      }
    };
    fetchFamilyDetails();
  }, [familyId, headAsMember, token]);

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
    setMessage('');
    setError('');

    if (!familyId || !name || !dob) {
      setError('Please fill required fields: Family ID, Name, Date of Birth');
      return;
    }

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

      setMessage(`Member ${res.data.name} added successfully. Member ID: ${res.data.member_id}`);
      
      // Reset form
      setName(''); setDob(''); setAge(''); setMaritalStatus(''); setRelationship('');
      setQualification(''); setProfession(''); setResidingHere(true); setChurchGroup('');
      setActive(true); setBaptismDate(''); setBaptismPlace(''); setHolyCommunionDate('');
      setHolyCommunionPlace(''); setConfirmationDate(''); setConfirmationPlace('');
      setMarriageDate(''); setMarriagePlace(''); setMobile(''); setSex('');
      setHeadAsMember(false);
      setActiveStep(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member. Check Family ID.');
    }
  };

  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" mb={2} color="primary">Family & Basic Details</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Family ID*" value={familyId} onChange={(e) => setFamilyId(e.target.value.toUpperCase())} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Family Head" value={familyHead} InputProps={{ readOnly: true }} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Head Mobile" value={familyMobile} InputProps={{ readOnly: true }} />
            </Box>
            {error === 'Family not found' && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <FormControlLabel sx={{ mb: 2 }} control={<Checkbox checked={headAsMember} onChange={(e) => handleToggleHeadAsMember(e.target.checked)} disabled={!familyHead} />} label="Head as Member" />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Name*" value={name} onChange={(e) => setName(e.target.value)} disabled={headAsMember} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Date of Birth*" type="date" value={dob} onChange={(e) => setDob(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField sx={{ flex: 1, minWidth: '100px' }} label="Age" value={age} InputProps={{ readOnly: true }} />
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1, minWidth: '200px' }}>
                <InputLabel>Sex</InputLabel>
                <Select value={sex} onChange={(e) => setSex(e.target.value)} label="Sex">
                  <MenuItem value="">--Select--</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Transgender">Transgender</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 1, minWidth: '200px' }}>
                <InputLabel>Relationship</InputLabel>
                <Select value={relationship} onChange={(e) => setRelationship(e.target.value)} label="Relationship" disabled={headAsMember}>
                  <MenuItem value="">--Select--</MenuItem>
                  {["Head", "Spouse", "Child", "Father", "Mother", "Father in Law", "Mother in Law", "Other"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" mb={2} color="primary">Contact & Status</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <FormControl sx={{ flex: 1, minWidth: '200px' }}>
                <InputLabel>Marital Status</InputLabel>
                <Select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} label="Marital Status">
                  <MenuItem value="">--Select--</MenuItem>
                  {["Single", "Married", "Divorced", "Widowed"].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Church Group" value={churchGroup} onChange={(e) => setChurchGroup(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
              {role === 'admin' && (
                <>
                  <FormControlLabel control={<Checkbox checked={residingHere} onChange={(e) => setResidingHere(e.target.checked)} />} label="Residing Here" />
                  <FormControlLabel control={<Checkbox checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
                </>
              )}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" mb={2} color="primary">Sacraments</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Baptism Date" type="date" value={baptismDate} onChange={(e) => setBaptismDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Baptism Place" value={baptismPlace} onChange={(e) => setBaptismPlace(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Holy Communion Date" type="date" value={holyCommunionDate} onChange={(e) => setHolyCommunionDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Holy Communion Place" value={holyCommunionPlace} onChange={(e) => setHolyCommunionPlace(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Confirmation Date" type="date" value={confirmationDate} onChange={(e) => setConfirmationDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Confirmation Place" value={confirmationPlace} onChange={(e) => setConfirmationPlace(e.target.value)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Marriage Date" type="date" value={marriageDate} onChange={(e) => setMarriageDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField sx={{ flex: 1, minWidth: '200px' }} label="Marriage Place" value={marriagePlace} onChange={(e) => setMarriagePlace(e.target.value)} />
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 3, px: 2, pb: 4 }}>
      <Box sx={{ backgroundColor: '#03a8f5ff', color: '#000', p: 2, borderRadius: 2, mb: 4, textAlign: 'center', boxShadow: 1 }}>
        <Typography variant="h5" fontWeight="bold">Add Member</Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        {renderStepContent(activeStep)}

        {message && (
          <Box textAlign="center" mt={2}>
            <Typography color="success.main" mb={1}>{message}</Typography>
            <Button variant="outlined" onClick={() => navigate('/')} size="small">Go to Dashboard</Button>
          </Box>
        )}
        {error && <Typography color="error" mt={2} textAlign="center">{error}</Typography>}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined" sx={{ fontWeight: 'bold' }}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleAddMember} variant="contained" sx={{ backgroundColor: '#03a8f5ff', color: '#000', fontWeight: 'bold', '&:hover': { backgroundColor: '#0288d1' } }}>
              Add Member
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained" sx={{ backgroundColor: '#03a8f5ff', color: '#000', fontWeight: 'bold', '&:hover': { backgroundColor: '#0288d1' } }}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AddMember;
