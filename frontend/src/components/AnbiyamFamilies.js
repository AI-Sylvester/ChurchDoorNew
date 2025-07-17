import React, { useEffect, useState, useCallback } from 'react';
import {
  Paper, Typography, CircularProgress, Alert, Grid, FormControl,
  InputLabel, Select, MenuItem, Box, Table, TableHead, TableRow,
  TableCell, TableBody, Button, useTheme, useMediaQuery, Tabs, Tab
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../config';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/react';
import { saveAs } from 'file-saver';

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
        `${API_BASE_URL}/members/by-anbiyam/${encodeURIComponent(anbiyamName)}`,
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

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const title = `Family Details - (${selectedAnbiyam || 'All'})`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const centerX = (pageWidth - textWidth) / 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#0B3D91');
    doc.text(title, centerX, 25);

    const tableData = families.map((fam, index) => [
      index + 1,
      fam.family_id || '-',
      fam.head_name || '-',
      fam.mobile_number || '-',
      [fam.address_line1, fam.address_line2, fam.city].filter(Boolean).join(', ') || '-',
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['S.No', 'Family ID', 'Head Name', 'Mobile', 'Address']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [11, 61, 145],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: { fillColor: [245, 249, 255] },
      styles: { fontSize: 10, cellPadding: 4, textColor: 20 },
      margin: { top: 20, left: 15, right: 15 },
    });

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
    const fileName = `Families_${selectedAnbiyam || 'All'}_${timestamp}.pdf`;
    const pdfBlob = doc.output('blob');

    if (isPlatform('android') || isPlatform('ios')) {
      const base64 = await blobToBase64(pdfBlob);
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
      });
      alert(`PDF saved in app's Documents folder: ${fileName}`);
    } else {
      saveAs(pdfBlob, fileName);
    }
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

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
            Anbiyam Report
          </Typography>
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
          <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary">
            <Tab label="Families" />
            <Tab label="Members" />
          </Tabs>

          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {tabIndex === 0 && (
                <>
                  <Box display="flex" justifyContent="flex-end" my={2}>
                    <Button variant="outlined" onClick={exportToPDF}>
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
                        <TableCell sx={{ color: 'white' }}>Relation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((mem, index) => (
                        <TableRow key={mem.member_id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{mem.member_id}</TableCell>
                          <TableCell>{mem.name}</TableCell>
                          <TableCell>{mem.gender}</TableCell>
                          <TableCell>{mem.mobile_number}</TableCell>
                          <TableCell>{mem.relation}</TableCell>
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
