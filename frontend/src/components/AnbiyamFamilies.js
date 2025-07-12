import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Typography, CircularProgress, Alert, Grid, FormControl,
  InputLabel, Select, MenuItem, Box, Table, TableHead, TableRow,
  TableCell, TableBody, Button, useTheme, useMediaQuery
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../config';

const AnbiyamFamilyView = () => {
  const [anbiyams, setAnbiyams] = useState([]);
  const [selectedAnbiyam, setSelectedAnbiyam] = useState('');
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!token) return;
    const fetchAnbiyams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/anbiyam`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnbiyams(res.data);
      } catch (err) {
        setError('Failed to load Anbiyam list.');
      }
    };
    fetchAnbiyams();
  }, [token]);

  const fetchFamilies = useCallback(async (anbiyamName) => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(
        `${API_BASE_URL}/family/anbiyamfam/${encodeURIComponent(anbiyamName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFamilies(res.data);
    } catch (err) {
      setError('Failed to load families for the selected Anbiyam.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleAnbiyamChange = (e) => {
    const selectedName = e.target.value;
    setSelectedAnbiyam(selectedName);
    fetchFamilies(selectedName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    const title = `Family Details - (${selectedAnbiyam})`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const centerX = (pageWidth - textWidth) / 2;
    doc.text(title, centerX, 20);
    const tableData = families.map((fam, index) => ([
      index + 1,
      fam.family_id,
      fam.head_name,
      fam.mobile_number,
      `${fam.address_line1 || ''}, ${fam.address_line2 || ''}, ${fam.city || ''}`
    ]));
    autoTable(doc, {
      startY: 30,
      head: [['S.No', 'Family ID', 'Head Name', 'Mobile', 'Address']],
      body: tableData,
    });
    doc.save(`Families_${selectedAnbiyam}.pdf`);
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid
        container
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        direction={isMobile ? 'column' : 'row'}
      >
        <Grid item xs={12} sm="auto">
          <Typography variant="h6" textAlign={isMobile ? 'center' : 'left'}>
            Family List by Anbiyam
          </Typography>
        </Grid>

        <Grid item xs={12} sm="auto">
          <FormControl fullWidth={isMobile} size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Anbiyam</InputLabel>
            <Select
              value={selectedAnbiyam}
              onChange={handleAnbiyamChange}
              label="Anbiyam"
            >
              {anbiyams.map((anb) => (
                <MenuItem key={anb.id} value={anb.name}>
                  {anb.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box mt={3}>
        {selectedAnbiyam && (
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Family Details - ({selectedAnbiyam})
          </Typography>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : families.length > 0 ? (
          <>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="outlined" color="primary" onClick={exportToPDF}>
                Export to PDF
              </Button>
            </Box>

            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#0B3D91' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>S.No</TableCell>
                    <TableCell sx={{ color: 'white' }}>Family ID</TableCell>
                    <TableCell sx={{ color: 'white' }}>Head Name</TableCell>
                    <TableCell sx={{ color: 'white' }}>Mobile</TableCell>
                    <TableCell sx={{ color: 'white' }}>Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {families.map((fam, index) => (
                    <TableRow key={fam.family_id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{fam.family_id}</TableCell>
                      <TableCell>{fam.head_name}</TableCell>
                      <TableCell>{fam.mobile_number}</TableCell>
                      <TableCell>
                        {`${fam.address_line1 || ''}, ${fam.address_line2 || ''}, ${fam.city || ''}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        ) : (
          selectedAnbiyam && !error && (
            <Typography align="center">No families found for "{selectedAnbiyam}".</Typography>
          )
        )}
      </Box>
    </Paper>
  );
};

export default AnbiyamFamilyView;
