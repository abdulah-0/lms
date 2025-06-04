// src/components/Layout.jsx
import React, { useState } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Drawer, Divider, List,
  ListItem, ListItemButton, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const drawerWidth = 240;

const navLinks = {
  Student: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/marks', label: 'Marks' },
    { to: '/studymaterials', label: 'Study Materials' },
    { to: '/fees', label: 'Fees' },
  ],
  Teacher: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/marks', label: 'Marks' },
    { to: '/studymaterials', label: 'Study Materials' },
    { to: '/salaries', label: 'Salaries' },
  ],
  Admin: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance Management' },
    { to: '/marks', label: 'Marks Management' },
    { to: '/studymaterials', label: 'Study Materials Management' },
    { to: '/users', label: 'User Management' },
    { to: '/fees-salaries', label: 'Fees/Salaries Management' },
  ],
  SuperAdmin: [
    { to: '/dashboard', label: 'Home' },
    { to: '/attendance', label: 'Attendance Management' },
    { to: '/marks', label: 'Marks Management' },
    { to: '/studymaterials', label: 'Study Materials Management' },
    { to: '/users', label: 'User Management' },
    { to: '/fees-salaries', label: 'Fees/Salaries Management' },
  ]
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = user ? navLinks[user.role] || [] : [];

  const drawer = (
    <div>
      <Typography variant="h5" sx={{ p: 2 }}>
        LMS Dashboard
      </Typography>
      <Divider />
      <List>
        {links.map((link) => (
          <ListItem key={link.to} disablePadding selected={pathname === link.to}>
            <ListItemButton component={Link} to={link.to}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar for small screens */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, display: { sm: 'none' } }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            LMS Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Temporary drawer on mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer on desktop */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '64px', sm: 0 },
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
