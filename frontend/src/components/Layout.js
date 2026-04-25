import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  BottomNavigationAction,
  BottomNavigation,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import logo from './logo.png'; // adjust path as needed
const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState('/home');

  const handleLogout = () => setOpenLogoutDialog(true);
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Box sx={{ pb: 9 }}>
      {/* Top App Bar */}
    <AppBar
  position="fixed"
  sx={{
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    color: '#1E3A8A',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
  }}
>
  <Toolbar sx={{ justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
     <Box
    component="img"
    src={logo}
    alt="Logo"
    sx={{
      height: 20,
      width: 20,
      border: '2px solid #000',       // Square border
      borderRadius: 1,                 // Small corner rounding (0 = perfect square)
      objectFit: 'contain',
      backgroundColor: '#fff',         // Optional
      p: 0.5,                          // Optional padding
    }}
  />
     <Typography
  variant="h6"
  sx={{
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
    color: '#1E3A8A',
  }}
>
  Church Door
</Typography>

    </Box>
    <Box>
      <IconButton onClick={handleAvatarClick}>
       <Avatar sx={{ bgcolor: '#F59E0B', color: '#fff', width: 32, height: 32, fontSize: 14, fontWeight: 'bold' }}>A</Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  </Toolbar>
</AppBar>

      {/* Main content */}
      <Box sx={{ mt: 8, px: 2 }}>{children}</Box>

      {/* Bottom Fixed Footer with Scrollable Nav */}
<Paper
  sx={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    zIndex: 1000,
    borderTop: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05)',
  }}
  elevation={0}
>
  <BottomNavigation
    value={selectedPath}
    onChange={(event, newValue) => {
      setSelectedPath(newValue);
      navigate(newValue);
    }}
    showLabels
    sx={{ 
      backgroundColor: 'transparent',
      height: 65, // slightly taller for better tap targets
    }}
  >
    <BottomNavigationAction
      label="Home"
      value="/home"
      icon={<SpaceDashboardRoundedIcon />}
      sx={{
        color: selectedPath === '/home' ? '#1E3A8A' : '#64748B',
        transition: 'all 0.3s ease',
        '&.Mui-selected': { color: '#1E3A8A', fontWeight: 'bold', transform: 'scale(1.05)' },
      }}
    />
    <BottomNavigationAction
      label="Families"
      value="/familylist"
      icon={<GroupsRoundedIcon />}
      sx={{
        color: selectedPath === '/familylist' ? '#1E3A8A' : '#64748B',
        transition: 'all 0.3s ease',
        '&.Mui-selected': { color: '#1E3A8A', fontWeight: 'bold', transform: 'scale(1.05)' },
      }}
    />
    <BottomNavigationAction
      label="Members"
      value="/memlist"
      icon={<GroupRoundedIcon />}
      sx={{
        color: selectedPath === '/memlist' ? '#1E3A8A' : '#64748B',
        transition: 'all 0.3s ease',
        '&.Mui-selected': { color: '#1E3A8A', fontWeight: 'bold', transform: 'scale(1.05)' },
      }}
    />
    <BottomNavigationAction
      label="Register"
      value="/add-family"
      icon={<PersonAddAltRoundedIcon />}
      sx={{
        color: selectedPath === '/add-family' ? '#1E3A8A' : '#64748B',
        transition: 'all 0.3s ease',
        '&.Mui-selected': { color: '#1E3A8A', fontWeight: 'bold', transform: 'scale(1.05)' },
      }}
    />
  </BottomNavigation>
</Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Do you want to log out?</DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
              setOpenLogoutDialog(false);
            }}
          >
            Logout 
          </Button>
      
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;
