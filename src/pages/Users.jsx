import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getUsers, addUser, updateUser, deleteUser, approveUser } from '../api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../components/AuthContext';

const roles = ['Student', 'Admin', 'Teacher', 'SuperAdmin'];
const assignableRoles = (userRole) => userRole === 'SuperAdmin' ? roles : ['Student', 'Teacher'];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student', rollNo: '', department: '' });
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [approveDialog, setApproveDialog] = useState({ open: false, user: null, role: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpen = (user = null) => {
    setEditUser(user);
    setForm(user ? { ...user, password: '' } : { name: '', email: '', password: '', role: 'Student', rollNo: '', department: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.name || !form.email || (!editUser && !form.password) || !form.role) {
      enqueueSnackbar('Name, Email, Password and Role are required', { variant: 'warning' });
      return;
    }
    if (form.role === 'Student' && !form.rollNo) {
      enqueueSnackbar('Roll No is required for Student', { variant: 'warning' });
      return;
    }
    if (form.role === 'Teacher' && !form.department) {
      enqueueSnackbar('Department is required for Teacher', { variant: 'warning' });
      return;
    }

    try {
      if (editUser) {
        await updateUser(editUser._id, form);
        enqueueSnackbar('User updated', { variant: 'success' });
      } else {
        await addUser(form);
        enqueueSnackbar('User added', { variant: 'success' });
      }
      fetchUsers();
      handleClose();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to save user', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      enqueueSnackbar('User deleted', { variant: 'success' });
      fetchUsers();
    } catch (err) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  const handleApprove = (user) => {
    setApproveDialog({ open: true, user, role: user.pendingRole || 'Student' });
  };

  const handleApproveSubmit = async () => {
    try {
      await approveUser(approveDialog.user._id, approveDialog.role);
      enqueueSnackbar('User approved', { variant: 'success' });
      setApproveDialog({ open: false, user: null, role: '' });
      fetchUsers();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to approve user', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">User Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add User</Button>
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
              <TableRow key={u._id} style={!u.approved ? { background: '#fffde7' } : {}}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role || '-'}</TableCell>
                <TableCell>{u.pendingRole || '-'}</TableCell>
                <TableCell>{u.approved ? 'Yes' : 'No'}</TableCell>
                <TableCell>{u.rollNo || '-'}</TableCell>
                <TableCell>{u.department || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(u)}><Edit /></IconButton>
                  {u._id !== user._id && (
                    <IconButton color="error" onClick={() => handleDelete(u._id)}><Delete /></IconButton>
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
          <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth margin="normal" type="password" helperText={editUser ? 'Leave blank to keep unchanged' : ''} />
          <TextField select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal">
            {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          {form.role === 'Student' && (
            <TextField label="Roll No" name="rollNo" value={form.rollNo} onChange={handleChange} fullWidth margin="normal" />
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
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, user: null, role: '' })}>
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assign Role</InputLabel>
            <Select
              label="Assign Role"
              value={approveDialog.role}
              onChange={e => setApproveDialog({ ...approveDialog, role: e.target.value })}
            >
              {assignableRoles(user.role).map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({ open: false, user: null, role: '' })}>Cancel</Button>
          <Button variant="contained" onClick={handleApproveSubmit}>Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
