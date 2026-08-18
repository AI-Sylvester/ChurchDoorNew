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
import { useNavigate, useLocation } from 'react-router-dom';

import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import logo from './logo.png';

const Layout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem('role') || 'family';
  const username = localStorage.getItem('username') || 'U';

  const handleLogout = () => {
    setAnchorEl(null);
    setOpenLogoutDialog(true);
  };
  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const avatarColor =
    role === 'admin' ? '#BE123C' :
    role === 'incharge' ? '#7C3AED' : '#F59E0B';

  // Determine current active nav value
  const currentPath = location.pathname;

  const adminNavItems = [
    { label: 'Home', value: '/home', icon: <SpaceDashboardRoundedIcon /> },
    { label: 'Families', value: '/familylist', icon: <GroupsRoundedIcon /> },
    { label: 'New', value: '/add-family', icon: <PersonAddAltRoundedIcon /> },
    { label: 'Members', value: '/memlist', icon: <GroupRoundedIcon /> },
  ];

  const inchargeNavItems = [
    { label: 'Home', value: '/home', icon: <SpaceDashboardRoundedIcon /> },
    { label: 'Families', value: '/anbiyamfam', icon: <GroupsRoundedIcon /> },
    { label: 'Add', value: '/add-family', icon: <PersonAddAltRoundedIcon /> },
    { label: 'Verify', value: '/verify-registrations', icon: <VerifiedUserIcon /> },
  ];

  const familyNavItems = [
    { label: 'Home', value: '/home', icon: <SpaceDashboardRoundedIcon /> },
    { label: 'My Family', value: '/my-family', icon: <GroupsRoundedIcon /> },
  ];

  const navItems =
    role === 'admin' ? adminNavItems :
    role === 'incharge' ? inchargeNavItems :
    familyNavItems;

  return (
    <Box sx={{ pb: '90px' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#1E3A8A',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          boxShadow: 'none',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                height: 32,
                width: 32,
                borderRadius: 2,
                objectFit: 'cover',
                border: '1.5px solid rgba(30,58,138,0.15)',
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontFamily: "'Outfit', sans-serif",
                  color: '#1E3A8A',
                  lineHeight: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                }}
              >
                Church Door
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                }}
              >
                {role === 'admin' ? 'Parish Admin' : role === 'incharge' ? 'Anbiyam Incharge' : 'Family'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleAvatarClick} size="small" sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: avatarColor,
                  color: '#fff',
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  boxShadow: `0 4px 12px ${avatarColor}50`,
                }}
              >
                {username[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minWidth: 160,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  mt: 1,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                disabled
                sx={{
                  opacity: '1 !important',
                  py: 1.5,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#1E293B">
                    {username}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                    {role}
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: '#EF4444',
                  fontWeight: 700,
                  py: 1.5,
                  '&:hover': { bgcolor: '#FFF5F5' },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ mt: { xs: 7, sm: 8 }, px: { xs: 0, sm: 0 } }}>
        {children}
      </Box>

      {/* Fixed Bottom Navigation */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: 'calc(100% - 32px)', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 480 },
          minWidth: { sm: navItems.length * 80 },
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 1200,
          borderRadius: 6,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        <BottomNavigation
          value={currentPath}
          onChange={(event, newValue) => {
            navigate(newValue);
          }}
          sx={{
            backgroundColor: 'transparent',
            height: 64,
            px: 1,
            '& .MuiBottomNavigationAction-root': {
              color: '#94A3B8',
              minWidth: 'auto',
              flex: 1,
              borderRadius: 3,
              mx: 0.5,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#1E3A8A',
                background: 'rgba(30, 58, 138, 0.06)',
                '& .MuiSvgIcon-root': {
                  transform: 'translateY(-1px)',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 800,
                  fontSize: '0.65rem',
                },
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.6rem',
                fontWeight: 600,
                marginTop: '3px',
              },
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1E293B', pb: 1 }}>
          Sign out?
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography variant="body2" color="textSecondary">
            You'll need to sign in again to access Church Door.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenLogoutDialog(false)}
            sx={{ borderRadius: 3, fontWeight: 700, borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
              setOpenLogoutDialog(false);
            }}
            sx={{ borderRadius: 3, fontWeight: 800 }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;
