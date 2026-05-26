import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, Typography, Paper, TextField, Button, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress,
  Avatar, Stack, Divider
} from '@mui/material';
import API_BASE_URL from '../../config';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

const FAMILY_FIELDS = [
  { value: 'head_name', label: 'Head Name', type: 'text' },
  { value: 'address_line1', label: 'Address Line 1', type: 'text' },
  { value: 'address_line2', label: 'Address Line 2', type: 'text' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'pincode', label: 'Pincode', type: 'text' },
  { value: 'mobile_number', label: 'Mobile Number', type: 'text' },
  { value: 'mobile_number2', label: 'Alternate Mobile', type: 'text' },
  { value: 'cemetery', label: 'Cemetery Registered', type: 'select', options: ['yes', 'no'] },
  { value: 'cemetery_number', label: 'Cemetery Number', type: 'text' },
  { value: 'old_card_number', label: 'Old Card Number', type: 'text' },
  { value: 'native', label: 'Native Place', type: 'text' },
  { value: 'resident_from', label: 'Resident From (Year)', type: 'text' },
  { value: 'house_type', label: 'House Type', type: 'select', options: ['Own', 'Rental', 'Lease'] },
  { value: 'subscription', label: 'Subscription Details', type: 'text' },
  { value: 'anbiyam', label: 'Anbiyam Group', type: 'text' },
  { value: 'location', label: 'Geo Location Pin', type: 'text' }
];

const MEMBER_FIELDS = [
  { value: 'name', label: 'Full Name', type: 'text' },
  { value: 'sex', label: 'Sex', type: 'select', options: ['Male', 'Female', 'Transgender'] },
  { value: 'dob', label: 'Date of Birth', type: 'date' },
  { value: 'relationship', label: 'Relationship', type: 'select', options: ['Spouse', 'Son', 'Daughter', 'Mother', 'Father', 'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Son-in-law', 'Daughter-in-law', 'Grandfather', 'Grandmother', 'Other'] },
  { value: 'marital_status', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
  { value: 'mobile', label: 'Mobile Number', type: 'text' },
  { value: 'qualification', label: 'Qualification', type: 'text' },
  { value: 'profession', label: 'Profession', type: 'text' },
  { value: 'church_group', label: 'Church Group', type: 'text' },
  { value: 'residing_here', label: 'Residing Here', type: 'select', options: ['true', 'false'], labels: { 'true': 'Yes', 'false': 'No' } },
  { value: 'active', label: 'Active Record', type: 'select', options: ['true', 'false'], labels: { 'true': 'Yes', 'false': 'No' } },
  { value: 'baptism_date', label: 'Baptism Date', type: 'date' },
  { value: 'baptism_place', label: 'Baptism Place', type: 'text' },
  { value: 'holy_communion_date', label: 'Holy Communion Date', type: 'date' },
  { value: 'holy_communion_place', label: 'Holy Communion Place', type: 'text' },
  { value: 'confirmation_date', label: 'Confirmation Date', type: 'date' },
  { value: 'confirmation_place', label: 'Confirmation Place', type: 'text' },
  { value: 'marriage_date', label: 'Marriage Date', type: 'date' },
  { value: 'marriage_place', label: 'Marriage Place', type: 'text' }
];

const RaiseUpdate = () => {
  const [familyData, setFamilyData] = useState(null);
  const [modifyOn, setModifyOn] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [additionalChanges, setAdditionalChanges] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    const fetchMyFamily = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/family-user/my-family`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFamilyData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your family details');
      } finally {
        setLoadingData(false);
      }
    };
    fetchMyFamily();
  }, []);

  // Update old value when selections change
  useEffect(() => {
    if (!familyData) return;

    if (modifyOn === 'family') {
      if (selectedField) {
        const fieldObj = FAMILY_FIELDS.find(f => f.value === selectedField);
        let val = familyData.family[selectedField] || '';
        if (fieldObj?.type === 'date') val = formatDate(val);
        if (val === true) val = 'true';
        if (val === false) val = 'false';
        setOldValue(val);
      } else {
        setOldValue('');
      }
    } else if (modifyOn === 'member') {
      if (selectedMemberId && selectedField) {
        const member = familyData.members.find(m => m.member_id === selectedMemberId);
        const fieldObj = MEMBER_FIELDS.find(f => f.value === selectedField);
        let val = member ? member[selectedField] || '' : '';
        if (fieldObj?.type === 'date') val = formatDate(val);
        if (val === true) val = 'true';
        if (val === false) val = 'false';
        setOldValue(val);
      } else {
        setOldValue('');
      }
    } else {
      setOldValue('');
    }
  }, [modifyOn, selectedMemberId, selectedField, familyData]);

  const handleModifyOnChange = (e) => {
    setModifyOn(e.target.value);
    setSelectedMemberId('');
    setSelectedField('');
    setNewValue('');
  };

  const handleMemberChange = (e) => {
    setSelectedMemberId(e.target.value);
    setSelectedField('');
    setNewValue('');
  };

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setNewValue('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modifyOn) {
      setError('Please select what you want to modify.');
      return;
    }
    if (modifyOn === 'member' && !selectedMemberId) {
      setError('Please select a family member.');
      return;
    }
    if (!selectedField && !additionalChanges) {
      setError('Please select a field to update or describe changes in detail.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const requested_data = {
        edit_type: modifyOn,
        field_name: selectedField,
        old_value: oldValue,
        new_value: newValue,
        additional_changes: additionalChanges
      };

      if (modifyOn === 'member') {
        const member = familyData.members.find(m => m.member_id === selectedMemberId);
        requested_data.member_id = selectedMemberId;
        requested_data.member_name = member ? member.name : '';
      }

      await axios.post(`${API_BASE_URL}/family-user/update-request`, {
        requested_data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Update request raised successfully! Admin and Incharge will review it.');
      setSelectedField('');
      setNewValue('');
      setAdditionalChanges('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise update request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderNewValueInput = () => {
    const fields = modifyOn === 'family' ? FAMILY_FIELDS : MEMBER_FIELDS;
    const fieldObj = fields.find(f => f.value === selectedField);
    if (!fieldObj) return null;

    const labelText = `Enter New ${fieldObj.label}`;

    if (fieldObj.type === 'select') {
      return (
        <FormControl fullWidth required>
          <InputLabel id="new-value-select-label">{labelText}</InputLabel>
          <Select
            labelId="new-value-select-label"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            label={labelText}
            sx={{ borderRadius: 3 }}
          >
            {fieldObj.options.map(opt => (
              <MenuItem key={opt} value={opt}>
                {fieldObj.labels ? fieldObj.labels[opt] || opt : opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (fieldObj.type === 'date') {
      return (
        <TextField
          fullWidth
          required
          type="date"
          label={labelText}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        required
        label={labelText}
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />
    );
  };

  if (loadingData) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" mt={15}>
        <CircularProgress thickness={5} size={50} sx={{ color: '#1E3A8A' }} />
        <Typography sx={{ mt: 2, fontWeight: 700, color: '#64748B' }}>Loading registration details...</Typography>
      </Box>
    );
  }

  const selectedFieldName = selectedField 
    ? (modifyOn === 'family' ? FAMILY_FIELDS : MEMBER_FIELDS).find(f => f.value === selectedField)?.label 
    : '';

  return (
    <Box sx={{ backgroundColor: '#F8FAFC', minHeight: '100vh', pb: 12, mt: -2, mx: -2 }}>
      
      {/* Premium Header Panel */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 
        pt: 5, 
        pb: 10, 
        px: 3, 
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32,
        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        color: '#fff'
      }}>
        {/* Decorative background shapes */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mb: 2, border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)' }}>
            <EditNoteIcon sx={{ fontSize: 36, color: '#FBBF24' }} />
          </Avatar>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-1.5px', mb: 0.5 }}>
            Request Update
          </Typography>
          <Typography variant="subtitle2" color="rgba(255,255,255,0.8)" fontWeight={600} sx={{ maxWidth: 450, mx: 'auto', px: 2 }}>
            Submit edits to registration fields. Requests will be verified by the Incharge and approved by the Admin.
          </Typography>
        </Box>
      </Box>

      {/* Floating Card Panel */}
      <Box sx={{ px: { xs: 2.5, sm: 3 }, mt: -5, position: 'relative', zIndex: 2, width: '100%', maxWidth: 620, mx: 'auto' }}>
        <Paper elevation={0} sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 6, 
          boxShadow: '0 15px 35px rgba(30, 58, 138, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          bgcolor: '#ffffff'
        }}>
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              
              {/* Step 1: Select modify target */}
              <FormControl fullWidth required>
                <InputLabel id="modify-on-label">Modify Target</InputLabel>
                <Select
                  labelId="modify-on-label"
                  value={modifyOn}
                  onChange={handleModifyOnChange}
                  label="Modify Target"
                  sx={{ borderRadius: 3, fontWeight: 700, color: '#1E293B' }}
                >
                  <MenuItem value="family" sx={{ fontWeight: 600 }}>Family Details</MenuItem>
                  <MenuItem value="member" sx={{ fontWeight: 600 }}>Member Details</MenuItem>
                </Select>
                <FormHelperText sx={{ fontWeight: 600 }}>Select the scope of data to modify</FormHelperText>
              </FormControl>

              {/* Step 2: If Member selected, choose member */}
              {modifyOn === 'member' && (
                <FormControl fullWidth required>
                  <InputLabel id="member-select-label">Select Family Member</InputLabel>
                  <Select
                    labelId="member-select-label"
                    value={selectedMemberId}
                    onChange={handleMemberChange}
                    label="Select Family Member"
                    sx={{ borderRadius: 3, fontWeight: 700, color: '#1E293B' }}
                  >
                    {familyData?.members?.map(m => (
                      <MenuItem key={m.member_id} value={m.member_id} sx={{ fontWeight: 600 }}>
                        {m.name} ({m.relationship})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Step 3: Choose field to modify */}
              {modifyOn && (modifyOn === 'family' || (modifyOn === 'member' && selectedMemberId)) && (
                <FormControl fullWidth>
                  <InputLabel id="field-select-label">Select Field to Modify</InputLabel>
                  <Select
                    labelId="field-select-label"
                    value={selectedField}
                    onChange={handleFieldChange}
                    label="Select Field to Modify"
                    sx={{ borderRadius: 3, fontWeight: 700, color: '#1E293B' }}
                  >
                    <MenuItem value="" sx={{ fontStyle: 'italic', fontWeight: 600 }}>
                      None (Only Additional Changes)
                    </MenuItem>
                    {(modifyOn === 'family' ? FAMILY_FIELDS : MEMBER_FIELDS).map(f => (
                      <MenuItem key={f.value} value={f.value} sx={{ fontWeight: 600 }}>
                        {f.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText sx={{ fontWeight: 600 }}>Choose a specific field to make a structured comparison</FormHelperText>
                </FormControl>
              )}

              {/* Step 4: Compare values side by side */}
              {selectedField && (
                <Stack spacing={2} sx={{ bgcolor: '#F8FAFC', p: 2.5, borderRadius: 5, border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="textSecondary" fontWeight={900} sx={{ textTransform: 'uppercase', letterSpacing: '0.8px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserRoundedIcon sx={{ fontSize: 16, color: '#3B82F6' }} /> Comparing Field: {selectedFieldName}
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#FFF1F2', border: '1px dashed #FDA4AF' }}>
                        <Typography variant="caption" color="error.dark" fontWeight={900} display="block" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Value</Typography>
                        <Typography variant="body2" fontWeight={800} color="#BE123C" sx={{ textDecoration: 'line-through', wordBreak: 'break-word', minHeight: 20 }}>
                          {oldValue === '' || oldValue === null || oldValue === undefined ? '[Unspecified]' : oldValue}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(30, 58, 138, 0.05)', color: '#1E3A8A' }}>
                        <ArrowForwardIcon sx={{ fontSize: 18, transform: { xs: 'rotate(90deg)', sm: 'none' } }} />
                      </Avatar>
                    </Grid>
                    
                    <Grid item xs={12} sm={5}>
                      {renderNewValueInput()}
                    </Grid>
                  </Grid>
                </Stack>
              )}

              {/* Step 5: Large Text Area for other changes */}
              <TextField 
                fullWidth 
                label="Other Changes / Additional Requests" 
                multiline 
                rows={4}
                value={additionalChanges} 
                onChange={(e) => setAdditionalChanges(e.target.value)} 
                placeholder="Describe any other changes, errors, or additional requests in detail..."
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#FCFDFE' },
                  '& .MuiInputLabel-root': { fontWeight: 600 }
                }}
              />

              <Divider sx={{ my: 1, opacity: 0.5 }} />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={{ 
                  py: 1.8, 
                  borderRadius: 4, 
                  fontWeight: 900, 
                  fontSize: '1rem',
                  textTransform: 'none', 
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #172554 0%, #1E3A8A 100%)',
                    boxShadow: '0 10px 25px rgba(30, 58, 138, 0.35)'
                  },
                  boxShadow: '0 8px 20px rgba(30, 58, 138, 0.2)',
                  transition: 'all 0.25s ease'
                }}
              >
                {submitting ? 'Submitting request...' : 'Submit Update Request'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RaiseUpdate;
