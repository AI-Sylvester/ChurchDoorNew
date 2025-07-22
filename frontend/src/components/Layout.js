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
  BottomNavigation,
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
import ContactsIcon from '@mui/icons-material/Contacts';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import logo from './logo.png'; // adjust path as needed
const Layout = ({ children }) => {

  const [anchorEl, setAnchorEl] = useState(null);
 
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
const [selectedPath, setSelectedPath] = useState('/home');

    const handleLogout = () => setOpenLogoutDialog(true);

  const navItems = [
    { path: '/home', icon: <SpaceDashboardRoundedIcon />, label: 'Home' },
      { path: '/familycard', icon: <ContactsIcon />, label: 'Card' },
        { path: '/familymap', icon: <MapRoundedIcon />, label: 'Map' },
                 { path: '/birthdays', icon: <CakeRoundedIcon />, label: 'Birthday' },
           { path: '/familydet', icon: <InfoOutlinedIcon />, label: 'Details' },
     { path: '/familylist', icon: <GroupsRoundedIcon />, label: 'Families' },
       { path: '/memlist', icon: <GroupRoundedIcon />, label: 'Members' },
       { path: '/add-family', icon: <ListAltRoundedIcon />, label: 'Register' },
    { path: '/add-member', icon: <PersonAddAltRoundedIcon />, label: 'Member' },
         { path: '/anbiyamfam', icon: <Diversity3RoundedIcon />, label: 'Anbiyam' },
        { path: 'logout', icon: <LogoutRoundedIcon color="error" />, label: 'Logout', action: handleLogout },
  ];

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

 


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
    backgroundColor: '#f7e600',
    color: '#000',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
    fontWeight: 200,
    fontFamily: "'Cinzel', serif",
    color: '#2C3E50',
  }}
>
  Church Door
</Typography>

    </Box>
    <Box>
      <IconButton onClick={handleAvatarClick}>
       <Avatar sx={{ bgcolor: '#0a151fff', width: 30, height: 30, fontSize: 14 }}>A</Avatar>
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
 <BottomNavigation
  value={selectedPath === '/home' ? '/home' : false}
  onChange={() => {
    setSelectedPath('/home');
    navigate('/home');
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }}
  showLabels
  sx={{ flex: '0 0 auto' }}
>
  <BottomNavigationAction
    label="Home"
    icon={<SpaceDashboardRoundedIcon />}
    value="/home"
    sx={{
      minWidth: 80,
      color: selectedPath === '/home' ? '#000' : '#555',
      '&.Mui-selected': {
        backgroundColor: '#f7e600',
        color: '#000',
        borderRadius: 2,
        fontWeight: 'bold',
      },
    }}
  />
</BottomNavigation>

  {/* Scrollable Nav for Remaining Items */}
  {showLeft && (
    <IconButton onClick={() => scroll('left')} size="small">
      <ArrowBackIosNewIcon fontSize="small" />
    </IconButton>
  )}

  <Box
    ref={scrollRef}
    sx={{
      overflowX: 'auto',
      display: 'flex',
      flex: 1,
      '::-webkit-scrollbar': { display: 'none' },
    }}
  >
   <BottomNavigation
  value={selectedPath}
  onChange={(event, newValue) => {
    const item = navItems.find((i) => i.path === newValue);
    if (item) {
      if (item.path === 'logout') item.action();
      else {
        setSelectedPath(item.path);
        navigate(item.path);
      }
    }
  }}
  showLabels
  sx={{
    display: 'flex',
    flexDirection: 'row',
    px: 1,
    py: 0.5,
    bgcolor: 'transparent',
    flexWrap: 'nowrap',
  }}
>
  {navItems.slice(1).map((item) => (
    <BottomNavigationAction
      key={item.label}
      value={item.path}
      label={item.label}
      icon={item.icon}
      sx={{
        flex: '0 0 auto',
        minWidth: 80,
        color: selectedPath === item.path ? '#000' : '#555',
        '&.Mui-selected': {
          backgroundColor: '#f7e600',
          color: '#000',
          borderRadius: 2,
          fontWeight: 'bold',
        },
      }}
    />
  ))}
</BottomNavigation>

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
