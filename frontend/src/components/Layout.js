import React, { useRef, useState, useEffect } from 'react';
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
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const Layout = ({ children }) => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
 
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);


    const handleLogout = () => setOpenLogoutDialog(true);

  const navItems = [
    { path: '/home', icon: <SpaceDashboardRoundedIcon />, label: 'Home' },
     { path: '/familylist', icon: <ListAltRoundedIcon />, label: 'List' },
      { path: '/familydet', icon: <InfoOutlinedIcon />, label: 'Details' },
     { path: '/familymap', icon: <MapRoundedIcon />, label: 'Map' },
    { path: '/add-family', icon: <GroupsRoundedIcon />, label: 'Family' },
    { path: '/add-member', icon: <PersonAddAltRoundedIcon />, label: 'Member' },
       { path: '/memlist', icon: <GroupRoundedIcon />, label: 'Members' },
       { path: '/anbiyamfam', icon: <Diversity3RoundedIcon />, label: 'Anbiyam' },
        { path: 'logout', icon: <LogoutRoundedIcon color="error" />, label: 'Logout', action: handleLogout },
  ];

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

 

  const handleNavClick = (item, index) => {
    setValue(index);
    if (item.path === 'logout') item.action();
    else if (item.path === 'sync') item.action();
    else navigate(item.path);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -150 : 150,
        behavior: 'smooth',
      });
    }
  };

  const checkScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      setShowLeft(container.scrollLeft > 10);
      setShowRight(container.scrollWidth - container.clientWidth - container.scrollLeft > 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScrollButtons);
    return () => {
      if (el) el.removeEventListener('scroll', checkScrollButtons);
    };
  }, []);

  return (
    <Box sx={{ pb: 9 }}>
      {/* Top App Bar */}
    <AppBar
  position="fixed"
  sx={{
    backgroundColor: '#f7e600', // Vatican yellow
    color: '#000', // Black text
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  }}
>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800}>
            Church Door
          </Typography>
          <Box>
            <IconButton onClick={handleAvatarClick}>
              <Avatar sx={{ bgcolor: '#0a151fff' }}>A</Avatar>
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
          bgcolor: '#fff',
          zIndex: 1000,
          borderTop: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
        }}
        elevation={8}
      >
        {showLeft && (
          <IconButton onClick={() => scroll('left')} size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        )}

        <Box
          ref={scrollRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            flex: 1,
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {navItems.map((item, index) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              onClick={() => handleNavClick(item, index)}
              sx={{
                flex: '0 0 auto',
                minWidth: 80,
                color: value === index ? '#1976d2' : '#555',
              }}
            />
          ))}
        </Box>

        {showRight && (
          <IconButton onClick={() => scroll('right')} size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>

      {/* Logout Confirmation Dialog */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Do you want to sync your data before logging out?</DialogContent>
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
