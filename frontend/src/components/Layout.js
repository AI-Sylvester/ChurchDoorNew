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
  const role = localStorage.getItem('role') || 'family';
  const username = localStorage.getItem('username') || 'U';

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
        <Avatar sx={{ bgcolor: role === 'admin' ? '#BE123C' : role === 'incharge' ? '#7C3AED' : '#F59E0B', color: '#fff', width: 32, height: 32, fontSize: 14, fontWeight: 'bold' }}>
          {username[0].toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  </Toolbar>
</AppBar>

      {/* Main content */}
      <Box sx={{ mt: 8, px: 2 }}>{children}</Box>

      {/* Fixed Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '90%', sm: 'auto' },
          minWidth: { sm: 400 },
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          borderRadius: 8,
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transition: 'all 0.3s ease'
        }}
        elevation={0}
      >
        <BottomNavigation
          value={selectedPath}
          onChange={(event, newValue) => {
            setSelectedPath(newValue);
            navigate(newValue);
          }}
          sx={{ 
            backgroundColor: 'transparent',
            height: 72,
            px: 2,
            '& .MuiBottomNavigationAction-root': {
              color: '#94A3B8',
              minWidth: 'auto',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#1E3A8A',
                '& .MuiSvgIcon-root': {
                  transform: 'translateY(-4px)',
                  filter: 'drop-shadow(0 4px 8px rgba(30, 58, 138, 0.3))'
                },
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  marginTop: '4px'
                }
              }
            }
          }}
        >
          <BottomNavigationAction
            label="Home"
            value="/home"
            icon={<SpaceDashboardRoundedIcon />}
          />

          {role === 'admin' && [
            <BottomNavigationAction key="f" label="Families" value="/familylist" icon={<GroupsRoundedIcon />} />,
            <BottomNavigationAction key="n" label="New" value="/add-family" icon={<PersonAddAltRoundedIcon />} />,
            <BottomNavigationAction key="m" label="Members" value="/memlist" icon={<GroupRoundedIcon />} />
          ]}

          {role === 'incharge' && [
            <BottomNavigationAction key="a" label="Families" value="/anbiyamfam" icon={<GroupsRoundedIcon />} />,
            <BottomNavigationAction key="f" label="Add Family" value="/add-family" icon={<PersonAddAltRoundedIcon />} />,
            <BottomNavigationAction key="m" label="Add Member" value="/add-member" icon={<PersonAddAltRoundedIcon />} />,
            <BottomNavigationAction key="v" label="Verify" value="/verify-registrations" icon={<GroupRoundedIcon />} />
          ]}

          {role === 'family' && (
            <BottomNavigationAction label="My Family" value="/my-family" icon={<GroupsRoundedIcon />} />
          )}
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
