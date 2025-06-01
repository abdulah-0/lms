import React from 'react';
import { NavLink } from 'react-router-dom';
import { List, ListItem, ListItemText } from '@mui/material';

const Sidebar = () => (
  <div style={{ width: 240, background: '#f5f5f5', height: '100vh', padding: '1rem' }}>
    <List>
      <ListItem button component={NavLink} to="/dashboard" activeClassName="Mui-selected">
        <ListItemText primary="Dashboard" />
      </ListItem>
      <ListItem button component={NavLink} to="/materials" activeClassName="Mui-selected">
        <ListItemText primary="Materials" />
      </ListItem>
      {/* Add more links as needed */}
    </List>
  </div>
);

export default Sidebar;