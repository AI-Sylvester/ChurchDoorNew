import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper, Typography, CircularProgress, Alert,
  Box, Table, TableHead, TableRow,
  TableCell, TableBody, Button, useTheme, useMediaQuery, Tabs, Tab,
  Card, Stack, Avatar, Chip, Autocomplete, TextField
} from '@mui/material';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../config';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const AnbiyamFamilyView = () => {
  const navigate = useNavigate();
  const [anbiyams, setAnbiyams] = useState([]);
  const [selectedAnbiyam, setSelectedAnbiyam] = useState('');
  const [families, setFamilies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role') || 'family';
  const userAnbiyam = localStorage.getItem('anbiyam');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleAnbiyamSelect = useCallback(async (name) => {
    if (!name) {
      setSelectedAnbiyam('');
      setFamilies([]);
      setMembers([]);
      return;
    }
    setSelectedAnbiyam(name);
    setError('');
    setLoading(true);
    try {
      await Promise.all([fetchFamilies(name), fetchMembers(name)]);
    } finally {
      setLoading(false);
    }
  }, [fetchFamilies, fetchMembers]);

  useEffect(() => {
    if (role === 'incharge' && userAnbiyam) {
      handleAnbiyamSelect(userAnbiyam);
    }
  }, [role, userAnbiyam, handleAnbiyamSelect]);

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
      doc.save(fileName);
    } catch (err) {
      console.error('❌ Error saving PDF:', err);
      alert('❌ Failed to generate PDF.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: '#F8FAFC', minHeight: '100vh', mt: -2, mx: -2 }}>
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography variant="h4" fontWeight={900} color="#1E3A8A" sx={{ letterSpacing: '-1px', mb: 1 }}>
          Anbiyam Reports
        </Typography>
        <Typography variant="body2" color="textSecondary" fontWeight={500}>
          Search and view parish data by Anbiyam
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2.5, sm: 4 }, 
          borderRadius: 5, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', md: role === 'admin' ? '1 1 58%' : '1 1 100%' } }}>
            {role === 'admin' ? (
              <Box>
                <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: '1px' }}>
                  Quick Selection
                </Typography>
                <Autocomplete
                  options={anbiyams.map((anb) => anb.name)}
                  value={selectedAnbiyam || null}
                  onChange={(event, newValue) => handleAnbiyamSelect(newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Search or Select Anbiyam" 
                      variant="outlined"
                      placeholder="Type to search..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <FilterListIcon sx={{ color: '#94A3B8', mr: 1, ml: 0.5 }} />
                        ),
                        sx: { 
                          borderRadius: 4, 
                          bgcolor: '#fff',
                          height: 56,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                          '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                          '&:hover fieldset': { borderColor: '#1E3A8A' },
                          fontSize: '1rem',
                          fontWeight: 600
                        }
                      }}
                    />
                  )}
                  sx={{ width: '100%' }}
                />
              </Box>
            ) : (
              <Box>
                <Typography variant="h5" fontWeight={900} color="#1E3A8A">{userAnbiyam} Group Overview</Typography>
                <Typography variant="body2" color="textSecondary">Managing families and members in your assigned group.</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' } }}>
            {selectedAnbiyam ? (
              <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
                <Box sx={{ 
                  px: 2, py: 1, borderRadius: 3, 
                  bgcolor: '#EFF6FF', color: '#1E3A8A', 
                  textAlign: 'center', border: '1px solid #DBEAFE',
                  flex: 1
                }}>
                  <Typography variant="h6" fontWeight={900}>{families.length}</Typography>
                  <Typography variant="caption" fontWeight={700}>FAMILIES</Typography>
                </Box>
                <Box sx={{ 
                  px: 2, py: 1, borderRadius: 3, 
                  bgcolor: '#F5F3FF', color: '#7C3AED', 
                  textAlign: 'center', border: '1px solid #EDE9FE',
                  flex: 1
                }}>
                  <Typography variant="h6" fontWeight={900}>{members.length}</Typography>
                  <Typography variant="caption" fontWeight={700}>MEMBERS</Typography>
                </Box>
              </Stack>
            ) : (
              <Box sx={{ textAlign: { xs: 'center', md: 'left' }, opacity: 0.6 }}>
                <Typography variant="body2" color="textSecondary" fontWeight={500}>
                  Select an Anbiyam from the list to load and export the reports.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {selectedAnbiyam && (
        <Box>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 5, 
              overflow: 'hidden', 
              boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.05)',
              backgroundColor: '#fff'
            }}
          >
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              textColor="primary" 
              indicatorColor="primary"
              variant="fullWidth"
              sx={{ 
                bgcolor: '#F8FAFC', 
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                '& .MuiTab-root': { py: 2.5, fontWeight: 800, fontSize: '0.95rem' }
              }}
            >
              <Tab label="Family Directory" />
              <Tab label="Member Records" />
            </Tabs>

            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h6" fontWeight={900} color="#1E293B">
                  {tabIndex === 0 ? 'Anbiyam Family List' : 'Anbiyam Member List'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() => handlePDFExport(tabIndex === 0 ? 'families' : 'members')}
                  sx={{ 
                    borderRadius: 3.5, 
                    px: 3,
                    py: 1.2,
                    textTransform: 'none', 
                    fontWeight: 800,
                    bgcolor: '#1E3A8A',
                    boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)',
                    '&:hover': { bgcolor: '#172554', boxShadow: '0 6px 20px rgba(30, 58, 138, 0.4)' }
                  }}
                >
                  Export {isMobile ? 'PDF' : 'PDF Report'}
                </Button>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

              {loading ? (
                <Box display="flex" justifyContent="center" my={10}>
                  <CircularProgress thickness={5} size={50} color="primary" />
                </Box>
              ) : (
                <>
                  {tabIndex === 0 ? (
                    isMobile ? (
                      <Stack spacing={2.5}>
                        {families.map((fam, idx) => (
                          <Card key={fam.family_id} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem', bgcolor: '#1E3A8A', mr: 2, fontWeight: 900 }}>{idx + 1}</Avatar>
                              <Typography variant="subtitle1" fontWeight={900} color="#1E293B">{fam.head_name}</Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={700}>FAMILY ID</Typography>
                                <Typography variant="body2" fontWeight={600}>{fam.family_id}</Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={700}>MOBILE</Typography>
                                <Typography variant="body2" fontWeight={600}>{fam.mobile_number || '-'}</Typography>
                              </Box>
                            </Stack>
                            <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                            <Typography variant="caption" color="textSecondary" fontWeight={700}>ADDRESS</Typography>
                            <Typography variant="body2" color="#475569" sx={{ mt: 0.5 }}>
                              {[fam.address_line1, fam.address_line2, fam.city].filter(Boolean).join(', ')}
                            </Typography>
                            {(role === 'admin' || role === 'incharge') && (
                              <Button 
                                fullWidth 
                                variant="outlined" 
                                size="small" 
                                startIcon={<PersonAddIcon />} 
                                onClick={() => navigate(`/add-member?family_id=${fam.family_id}`)}
                                sx={{ mt: 2, borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                              >
                                Add Member
                              </Button>
                            )}
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                          <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>S.No</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Family ID</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Head Name</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Mobile</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Address</TableCell>
                              {(role === 'admin' || role === 'incharge') && <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Action</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {families.map((fam, index) => (
                              <TableRow key={fam.family_id} hover sx={{ '& td': { py: 2 } }}>
                                <TableCell fontWeight={700}>{index + 1}</TableCell>
                                <TableCell fontWeight={800} color="#1E3A8A">{fam.family_id}</TableCell>
                                <TableCell fontWeight={700}>{fam.head_name}</TableCell>
                                <TableCell fontWeight={600}>{fam.mobile_number}</TableCell>
                                <TableCell sx={{ color: '#64748B' }}>{[fam.address_line1, fam.address_line2, fam.city].filter(Boolean).join(', ')}</TableCell>
                                {(role === 'admin' || role === 'incharge') && (
                                  <TableCell>
                                    <Button 
                                      variant="outlined" 
                                      size="small" 
                                      startIcon={<PersonAddIcon />} 
                                      onClick={() => navigate(`/add-member?family_id=${fam.family_id}`)}
                                      sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}
                                    >
                                      Add Member
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )
                  ) : (
                    isMobile ? (
                      <Stack spacing={2.5}>
                        {members.map((mem, idx) => (
                          <Card key={mem.member_id} sx={{ p: 2.5, borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem', bgcolor: '#6366F1', mr: 2, fontWeight: 900 }}>{idx + 1}</Avatar>
                              <Typography variant="subtitle1" fontWeight={900} color="#1E293B">{mem.name}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} mb={2}>
                              <Chip label={mem.sex} size="small" sx={{ fontWeight: 800, bgcolor: mem.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', color: mem.sex === 'Male' ? '#1E3A8A' : '#BE123C' }} />
                              <Chip label={`Age: ${mem.age}`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={700}>MEMBER ID</Typography>
                                <Typography variant="body2" fontWeight={600}>{mem.member_id}</Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={700}>MOBILE</Typography>
                                <Typography variant="body2" fontWeight={600}>{mem.mobile || '-'}</Typography>
                              </Box>
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    ) : (
                      <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                          <TableHead sx={{ backgroundColor: '#F1F5F9' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>S.No</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Member ID</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Name</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Gender</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Mobile</TableCell>
                              <TableCell sx={{ fontWeight: 900, color: '#475569' }}>Age</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {members.map((mem, index) => (
                              <TableRow key={mem.member_id} hover sx={{ '& td': { py: 2 } }}>
                                <TableCell fontWeight={700}>{index + 1}</TableCell>
                                <TableCell fontWeight={800} color="#1E3A8A">{mem.member_id}</TableCell>
                                <TableCell fontWeight={700}>{mem.name}</TableCell>
                                <TableCell>
                                  <Chip label={mem.sex} size="small" sx={{ fontWeight: 800, bgcolor: mem.sex === 'Male' ? '#EFF6FF' : '#FFF1F2', color: mem.sex === 'Male' ? '#1E3A8A' : '#BE123C' }} />
                                </TableCell>
                                <TableCell fontWeight={600}>{mem.mobile}</TableCell>
                                <TableCell fontWeight={800}>{mem.age}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AnbiyamFamilyView;
const TableContainer = ({ children }) => <Box sx={{ overflowX: 'auto', mt: 1 }}>{children}</Box>;
const Divider = ({ sx }) => <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.08)', ...sx }} />;
