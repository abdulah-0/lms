// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, IconButton, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthContext';

const roles = ['Student', 'Admin', 'Teacher', 'SuperAdmin'];

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Student', roll_no: '', department: '' });
  const [approveDialog, setApproveDialog] = useState({ open: false, user: null, role: 'Student' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpen = (user = null) => {
    setEditUser(user);
    setForm(user ? {
      name: user.name,
      email: user.email,
      role: user.role || 'Student',
      roll_no: user.roll_no || '',
      department: user.department || ''
    } : {
      name: '', email: '', role: 'Student', roll_no: '', department: ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, email, role, roll_no, department } = form;
    if (!name || !email || !role) {
      enqueueSnackbar('Name, email and role are required', { variant: 'warning' });
      return;
    }

    try {
      if (editUser) {
        const { error } = await supabase.from('users').update({
          name, email, role,
          roll_no: role === 'Student' ? roll_no : null,
          department: role === 'Teacher' ? department : null
        }).eq('id', editUser.id);

        if (error) throw error;
        enqueueSnackbar('User updated', { variant: 'success' });
      } else {
        const { error } = await supabase.from('users').insert([{
          name, email, role,
          approved: true,
          roll_no: role === 'Student' ? roll_no : null,
          department: role === 'Teacher' ? department : null
        }]);

        if (error) throw error;
        enqueueSnackbar('User added', { variant: 'success' });
      }

      fetchUsers();
      handleClose();
    } catch (err) {
      enqueueSnackbar(err.message || 'Failed to save user', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;

    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    } else {
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
    }
  };

  const handleApprove = (u) => {
    setApproveDialog({ open: true, user: u, role: u.pending_role || 'Student' });
  };

  const handleApproveSubmit = async () => {
    const u = approveDialog.user;
    const { error } = await supabase
      .from('users')
      .update({ role: approveDialog.role, approved: true })
      .eq('id', u.id);

    if (error) {
      enqueueSnackbar('Approval failed', { variant: 'error' });
    } else {
      enqueueSnackbar('User approved', { variant: 'success' });
      setApproveDialog({ open: false, user: null, role: 'Student' });
      fetchUsers();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add User
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Pending Role</TableCell>
              <TableCell>Approved</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} style={!u.approved ? { background: '#fffde7' } : {}}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role || '-'}</TableCell>
                <TableCell>{u.pending_role || '-'}</TableCell>
                <TableCell>{u.approved ? 'Yes' : 'No'}</TableCell>
                <TableCell>{u.roll_no || '-'}</TableCell>
                <TableCell>{u.department || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(u)}><Edit /></IconButton>
                  {u.id !== user.id && (
                    <IconButton color="error" onClick={() => handleDelete(u.id)}><Delete /></IconButton>
                  )}
                  {!u.approved && (
                    <Button size="small" color="success" variant="outlined" onClick={() => handleApprove(u)}>
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" type="email" />
          <TextField select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal">
            {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          {form.role === 'Student' && (
            <TextField label="Roll No" name="roll_no" value={form.roll_no} onChange={handleChange} fullWidth margin="normal" />
          )}
          {form.role === 'Teacher' && (
            <TextField label="Department" name="department" value={form.department} onChange={handleChange} fullWidth margin="normal" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editUser ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, user: null, role: 'Student' })}>
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Role</InputLabel>
            <Select
              label="Assign Role"
              value={approveDialog.role}
              onChange={(e) => setApproveDialog({ ...approveDialog, role: e.target.value })}
            >
              {roles.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({ open: false, user: null, role: 'Student' })}>Cancel</Button>
          <Button variant="contained" onClick={handleApproveSubmit}>Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
