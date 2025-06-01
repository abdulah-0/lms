import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { registerPublicUser } from '../api';
import { useNavigate } from 'react-router-dom';

const roles = ['Student', 'Teacher'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', pendingRole: 'Student', rollNo: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerPublicUser(form);
      enqueueSnackbar('Registration successful! Awaiting approval.', { variant: 'success' });
      navigate('/login');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Registration failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, backgroundColor: '#1e1e1e' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography variant="h4" color="primary" textAlign="center">Register</Typography>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required InputProps={{ style: { color: '#fff' } }} />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required type="email" InputProps={{ style: { color: '#fff' } }} />
            <TextField label="Password" name="password" value={form.password} onChange={handleChange} fullWidth required type="password" InputProps={{ style: { color: '#fff' } }} />
            <TextField select label="Role" name="pendingRole" value={form.pendingRole} onChange={handleChange} fullWidth required>
              {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            {form.pendingRole === 'Student' && (
              <TextField label="Roll No" name="rollNo" value={form.rollNo} onChange={handleChange} fullWidth InputProps={{ style: { color: '#fff' } }} />
            )}
            {form.pendingRole === 'Teacher' && (
              <TextField label="Department" name="department" value={form.department} onChange={handleChange} fullWidth InputProps={{ style: { color: '#fff' } }} />
            )}
            <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
} 