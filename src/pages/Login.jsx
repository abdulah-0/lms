import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Stack, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { loginUser } from '../api';
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
    try {
      const res = await loginUser(email, password);
      login(res.data.user, res.data.token);
      enqueueSnackbar('Login successful!', { variant: 'success' });
      // Redirect by role
      if (res.data.user.role === 'Admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard'); // You can customize for student/teacher
      }
    } catch (err) {
      if (err.response?.status === 403) {
        enqueueSnackbar('Your account is awaiting approval by the superadmin.', { variant: 'warning' });
      } else {
        enqueueSnackbar(
          err.response?.data?.message || 'Invalid email or password',
          { variant: 'error' }
        );
      }
    } finally {
      setLoading(false);
    }
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
