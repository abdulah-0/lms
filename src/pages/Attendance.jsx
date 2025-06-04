// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Stack, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, InputLabel, Select, FormControl
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../supabaseClient';

const statusOptions = ['Present', 'Absent'];
const userTypeOptions = ['Student', 'Teacher'];

function Attendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ user_id: '', user_type: 'Student', date: '', status: 'Present' });
  const [filter, setFilter] = useState({ userType: '', userId: '', date: '' });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAttendance();
    if (user.role === 'Admin' || user.role === 'SuperAdmin') fetchUsers();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('attendance')
      .select('*, user_id (name, role)')
      .order('date', { ascending: false });

    if (error) {
      enqueueSnackbar('Error fetching attendance', { variant: 'error' });
    } else {
      setAttendanceData(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('id, name, role');
    if (error) {
      enqueueSnackbar('Error fetching users', { variant: 'error' });
    } else {
      setUsers(data);
    }
  };

  const handleOpenDialog = (record = null) => {
    setEditRecord(record);
    if (record) {
      setForm({
        user_id: record.user_id,
        user_type: record.user_type,
        date: record.date?.slice(0, 10),
        status: record.status,
      });
    } else {
      setForm({ user_id: '', user_type: 'Student', date: '', status: 'Present' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.user_type || !form.date || !form.status) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }

    try {
      if (editRecord) {
        const { error } = await supabase
          .from('attendance')
          .update(form)
          .eq('id', editRecord.id);

        if (error) throw error;
        enqueueSnackbar('Attendance updated', { variant: 'success' });
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert([form]);

        if (error) throw error;
        enqueueSnackbar('Attendance added', { variant: 'success' });
      }

      fetchAttendance();
      handleCloseDialog();
    } catch (err) {
      enqueueSnackbar('Error saving attendance', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;

    const { error } = await supabase.from('attendance').delete().eq('id', id);
    if (error) {
      enqueueSnackbar('Error deleting attendance', { variant: 'error' });
    } else {
      enqueueSnackbar('Attendance deleted', { variant: 'success' });
      fetchAttendance();
    }
  };

  const renderFilters = () => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel>User Type</InputLabel>
        <Select
          label="User Type"
          name="userType"
          value={filter.userType}
          onChange={(e) => setFilter({ ...filter, userType: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          {userTypeOptions.map((ut) => (
            <MenuItem key={ut} value={ut}>{ut}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 180 }} size="small">
        <InputLabel>User</InputLabel>
        <Select
          label="User"
          name="userId"
          value={filter.userId}
          onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          {users
            .filter(u => !filter.userType || u.role === filter.userType)
            .map(u => (
              <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextField
        label="Date"
        type="date"
        size="small"
        value={filter.date}
        onChange={(e) => setFilter({ ...filter, date: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );

  const filteredData = attendanceData.filter((rec) => {
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      return rec.user_id?.id === user.id;
    }
    if (filter.userType && rec.user_type !== filter.userType) return false;
    if (filter.userId && rec.user_id?.id !== filter.userId) return false;
    if (filter.date && rec.date?.slice(0, 10) !== filter.date) return false;
    return true;
  });

  return (
    <Box sx={{ minHeight: '100vh', padding: { xs: 2, sm: 4 } }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4" color="primary">Attendance</Typography>
        {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Attendance
          </Button>
        )}
      </Stack>

      {(user.role === 'Admin' || user.role === 'SuperAdmin') && renderFilters()}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>User Type</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              {(user.role === 'Admin' || user.role === 'SuperAdmin') && <TableCell align="center"><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell>{rec.user_id?.name || '-'}</TableCell>
                <TableCell>{rec.user_type}</TableCell>
                <TableCell>{rec.date?.slice(0, 10) || '-'}</TableCell>
                <TableCell align="center">
                  <Chip label={rec.status} color={rec.status === 'Present' ? 'success' : 'default'} />
                </TableCell>
                {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(rec)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(rec.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={user.role === 'Admin' ? 5 : 4} align="center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editRecord ? 'Edit Attendance' : 'Add Attendance'}</DialogTitle>
        <DialogContent sx={{ minWidth: 350 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>User Type</InputLabel>
            <Select
              label="User Type"
              name="user_type"
              value={form.user_type}
              onChange={handleFormChange}
            >
              {userTypeOptions.map((ut) => (
                <MenuItem key={ut} value={ut}>{ut}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>User</InputLabel>
            <Select
              label="User"
              name="user_id"
              value={form.user_id}
              onChange={handleFormChange}
            >
              {users
                .filter(u => u.role === form.user_type)
                .map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editRecord ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Attendance;
