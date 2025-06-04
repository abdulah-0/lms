// src/pages/Register.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const roles = ['Student', 'Teacher'];

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    pendingRole: 'Student',
    rollNo: '',
    department: '',
  });
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
      // Step 1: Register auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // Step 2: Insert user profile (manually into users table)
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: authData.user.id, // Use same ID as Supabase Auth user
          name: form.name,
          email: form.email,
          role: null, // Will be approved later
          approved: false,
          pendingRole: form.pendingRole,
          roll_no: form.pendingRole === 'Student' ? form.rollNo : null,
          department: form.pendingRole === 'Teacher' ? form.department : null,
        },
      ]);

      if (insertError) throw insertError;

      enqueueSnackbar('Registration successful! Awaiting approval.', { variant: 'success' });
      navigate('/login');
    } catch (err) {
      enqueueSnackbar(err.message || 'Registration failed', { variant: 'error' });
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
