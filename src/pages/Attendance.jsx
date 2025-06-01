// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  InputLabel,
  Select,
  FormControl
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  getAttendance,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getUsers
} from '../api';
import { useAuth } from '../components/AuthContext';

const statusOptions = ['Present', 'Absent'];
const userTypeOptions = ['Student', 'Teacher'];

function Attendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm] = useState({ userId: '', userType: 'Student', date: '', status: 'Present' });
  const [filter, setFilter] = useState({ userType: '', userId: '', date: '' });
  const { enqueueSnackbar } = useSnackbar();

  // Fetch attendance and users
  useEffect(() => {
    fetchData();
    if (user.role === 'Admin') fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await getAttendance();
      setAttendanceData(data);
    } catch (err) {
      enqueueSnackbar('Error fetching attendance', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      enqueueSnackbar('Error fetching users', { variant: 'error' });
    }
  };

  // Filtered data for admin
  const filteredData = attendanceData.filter((rec) => {
    if (user.role !== 'Admin') return rec.userId?._id === user._id;
    if (filter.userType && rec.userType !== filter.userType) return false;
    if (filter.userId && rec.userId?._id !== filter.userId) return false;
    if (filter.date && rec.date.slice(0, 10) !== filter.date) return false;
    return true;
  });

  // Open dialog for add/edit
  const handleOpenDialog = (record = null) => {
    setEditRecord(record);
    if (record) {
      setForm({
        userId: record.userId?._id || '',
        userType: record.userType,
        date: record.date ? record.date.slice(0, 10) : '',
        status: record.status
      });
    } else {
      setForm({ userId: '', userType: 'Student', date: '', status: 'Present' });
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);

  // Handle form change
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update attendance
  const handleSubmit = async () => {
    if (!form.userId || !form.userType || !form.date || !form.status) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }
    try {
      if (editRecord) {
        await updateAttendance(editRecord._id, {
          userId: form.userId,
          userType: form.userType,
          date: form.date,
          status: form.status
        });
        enqueueSnackbar('Attendance updated', { variant: 'success' });
      } else {
        await addAttendance(form);
        enqueueSnackbar('Attendance added', { variant: 'success' });
      }
      fetchData();
      handleCloseDialog();
    } catch (err) {
      enqueueSnackbar('Error saving attendance', { variant: 'error' });
    }
  };

  // Delete attendance
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteAttendance(id);
      enqueueSnackbar('Attendance deleted', { variant: 'success' });
      fetchData();
    } catch (err) {
      enqueueSnackbar('Error deleting attendance', { variant: 'error' });
    }
  };

  // Admin: filter controls
  const renderFilters = () => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel>User Type</InputLabel>
        <Select
          label="User Type"
          name="userType"
          value={filter.userType}
          onChange={e => setFilter({ ...filter, userType: e.target.value })}
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
          onChange={e => setFilter({ ...filter, userId: e.target.value })}
        >
          <MenuItem value="">All</MenuItem>
          {users
            .filter(u => !filter.userType || u.role === filter.userType)
            .map(u => (
              <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextField
        label="Date"
        type="date"
        size="small"
        value={filter.date}
        onChange={e => setFilter({ ...filter, date: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', padding: { xs: 2, sm: 4 } }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4" color="primary">
          Attendance
        </Typography>
        {user.role === 'Admin' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Attendance
          </Button>
        )}
      </Stack>

      {user.role === 'Admin' && renderFilters()}

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, width: '100%', overflowX: 'auto', backgroundColor: '#fff' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>User Type</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              {user.role === 'Admin' && <TableCell align="center"><strong>Actions</strong></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((rec) => (
              <TableRow key={rec._id}>
                <TableCell>{rec.userId?.name || '-'}</TableCell>
                <TableCell>{rec.userType}</TableCell>
                <TableCell>{rec.date ? rec.date.slice(0, 10) : '-'}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={rec.status}
                    color={rec.status === 'Present' ? 'success' : 'default'}
                  />
                </TableCell>
                {user.role === 'Admin' && (
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(rec)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(rec._id)}><DeleteIcon /></IconButton>
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
              name="userType"
              value={form.userType}
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
              name="userId"
              value={form.userId}
              onChange={handleFormChange}
            >
              {users.filter(u => u.role === form.userType).map(u => (
                <MenuItem key={u._id} value={u._id}>{u.name} ({u.role})</MenuItem>
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
