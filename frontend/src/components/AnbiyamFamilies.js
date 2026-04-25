import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Typography, CircularProgress, Alert, Grid, FormControl,
  InputLabel, Select, MenuItem, Box, Table, TableHead, TableRow,
  TableCell, TableBody, Button, useTheme, useMediaQuery, Tabs, Tab,
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../config';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const AnbiyamFamilyView = () => {
  const [anbiyams, setAnbiyams] = useState([]);
  const [selectedAnbiyam, setSelectedAnbiyam] = useState('');
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

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
      const res = await axios.get(
        `${API_BASE_URL}/family/anbiyamfam/${encodeURIComponent(anbiyamName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFamilies(res.data);
    } catch {
      setError('Failed to load families for the selected Anbiyam.');
    }
  }, [token]);

  const fetchMembers = useCallback(async (anbiyamName) => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/member/by-anbiyam/${encodeURIComponent(anbiyamName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers(res.data);
    } catch {
      setError('Failed to load members for the selected Anbiyam.');
    }
  }, [token]);

  const handleAnbiyamChange = async (e) => {
    const name = e.target.value;
    setSelectedAnbiyam(name);
    setError('');
    setLoading(true);
    try {
      await Promise.all([fetchFamilies(name), fetchMembers(name)]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePDFExport = async (type) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
    const fileName = `Anbiyam_Report_${selectedAnbiyam || 'All'}_${timestamp}.pdf`;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0B3D91');
    doc.text(`Anbiyam: ${selectedAnbiyam || 'All'}`, pageWidth / 2, 20, { align: 'center' });

    let currentY = 30;

    if (type === 'families' || type === 'both') {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('Families List', 15, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY + 5,
        head: [['S.No', 'Family ID', 'Head Name', 'Mobile', 'Address']],
        body: families.map((fam, index) => [
          index + 1,
          fam.family_id || '-',
          fam.head_name || '-',
          fam.mobile_number || '-',
          [fam.address_line1, fam.address_line2, fam.city].filter(Boolean).join(', ') || '-',
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [11, 61, 145],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: { fillColor: [245, 249, 255] },
        styles: { fontSize: 10, cellPadding: 4, textColor: 20 },
        margin: { left: 15, right: 15 },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }

    if (type === 'members' || type === 'both') {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text('Members List', 15, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY + 5,
        head: [['S.No', 'Member ID', 'Name', 'Gender', 'Mobile', 'Age']],
        body: members.map((mem, index) => [
          index + 1,
          mem.member_id || '-',
          mem.name || '-',
          mem.sex || '-',
          mem.mobile || '-',
          mem.age || '-',
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [11, 61, 145],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: { fillColor: [245, 249, 255] },
        styles: { fontSize: 10, cellPadding: 4, textColor: 20 },
        margin: { left: 15, right: 15 },
      });
    }

    try {
      const arrayBuffer = doc.output('arraybuffer');
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));

      if (Capacitor.getPlatform() === 'web') {
        doc.save(fileName);
      } else {
        await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents,
          encoding: Encoding.Base64,
        });
        alert(`✅ PDF saved to device: ${fileName}`);
      }
    } catch (err) {
      console.error('❌ Error saving PDF:', err);
      alert('❌ Failed to generate/save PDF.');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={2} justifyContent="space-between" alignItems="center" direction={isMobile ? 'column' : 'row'}>
        <Grid item xs={12} sm="auto">
          <Box display="flex" alignItems="center" gap={2} justifyContent={isMobile ? 'center' : 'flex-start'}>
            <Typography variant="h6">
              Anbiyam Report
            </Typography>
            {anbiyams.length > 0 && (
              <Box sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', px: 1.5, py: 0.5, borderRadius: 5, fontWeight: 'bold', fontSize: '0.85rem' }}>
                Total: {anbiyams.length}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm="auto">
          <FormControl fullWidth={isMobile} size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Anbiyam</InputLabel>
            <Select value={selectedAnbiyam} onChange={handleAnbiyamChange} label="Anbiyam">
              {anbiyams.map((anb) => (
                <MenuItem key={anb.id} value={anb.name}>
                  {anb.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedAnbiyam && (
        <Box mt={3}>
          <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1.5} mb={2}>
  {[
    { label: 'Export Families', type: 'families' },
    { label: 'Export Members', type: 'members' },
    { label: 'Export Both', type: 'both' },
  ].map(({ label, type }) => (
    <Button
      key={type}
      variant="outlined"
      onClick={() => handlePDFExport(type)}
      sx={{
        fontSize: '0.8rem',
        px: 2.5,
        py: 1,
        textTransform: 'none',
        borderRadius: '12px',
      }}
    >
      {label}
    </Button>
  ))}
</Box>

          <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary">
            <Tab label="Families" />
            <Tab label="Members" />
          </Tabs>

          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
          ) : (
            <>
              {tabIndex === 0 && (
                <Box sx={{ overflowX: 'auto', mt: 2 }}>
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
                          <TableCell>{[fam.address_line1, fam.address_line2, fam.city].filter(Boolean).join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {tabIndex === 1 && (
                <Box sx={{ overflowX: 'auto', mt: 2 }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#0B3D91' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white' }}>S.No</TableCell>
                        <TableCell sx={{ color: 'white' }}>Member ID</TableCell>
                        <TableCell sx={{ color: 'white' }}>Name</TableCell>
                        <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                        <TableCell sx={{ color: 'white' }}>Mobile</TableCell>
                        <TableCell sx={{ color: 'white' }}>Age</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((mem, index) => (
                        <TableRow key={mem.member_id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{mem.member_id}</TableCell>
                          <TableCell>{mem.name}</TableCell>
                          <TableCell>{mem.sex}</TableCell>
                          <TableCell>{mem.mobile}</TableCell>
                          <TableCell>{mem.age}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AnbiyamFamilyView;
