// src/pages/Login.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    } else {
      // Fetch user profile from 'users' table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError) {
        enqueueSnackbar('User record not found', { variant: 'error' });
      } else if (!profile.approved) {
        enqueueSnackbar('Your account is awaiting approval.', { variant: 'warning' });
      } else {
        login(profile, data.session.access_token);
        enqueueSnackbar('Login successful!', { variant: 'success' });
        navigate('/dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, backgroundColor: '#1e1e1e' }}>
        <Stack spacing={3}>
          <Typography variant="h4" color="primary" textAlign="center">
            Login
          </Typography>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            InputProps={{ style: { color: '#fff' } }}
          />
          <TextField
            label="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{ style: { color: '#fff' } }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Don't have an account? <Link to="/register" style={{ color: '#90caf9' }}>Register</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;
