import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, TextField, Button, Alert, MenuItem, Stack } from '@mui/material';
import API_BASE_URL from '../../config';
import PaymentIcon from '@mui/icons-material/Payment';

const Payments = ({ type }) => {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/family-user/payment`, {
        amount,
        type,
        transaction_id: transactionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Payment details submitted successfully for verification!');
      setAmount('');
      setTransactionId('');
    } catch (err) {
      setError('Failed to submit payment details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, pb: 10 }}>
      <Paper sx={{ p: 4, borderRadius: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <PaymentIcon sx={{ fontSize: 60, color: '#059669', mb: 1 }} />
          <Typography variant="h5" fontWeight={900}>
            {type === 'subscription' ? 'Monthly Subscription' : 'Church Donation'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Enter payment details after completing the transfer.
          </Typography>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Transaction ID / Ref Number"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              py: 2, 
              borderRadius: 3, 
              fontWeight: 800, 
              bgcolor: '#059669',
              '&:hover': { bgcolor: '#047857' }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Payment Info'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Payments;
