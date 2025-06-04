// src/pages/Marks.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthContext';

function Marks() {
  const { user } = useAuth();
  const [marksData, setMarksData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const [newEntry, setNewEntry] = useState({
    user_id: '',
    subject: '',
    test_no: '',
    marks: '',
    total_marks: '',
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchMarks();
    if (user.role === 'Admin' || user.role === 'SuperAdmin' || user.role === 'Teacher') {
      fetchStudents();
    }
  }, []);

  const fetchMarks = async () => {
    const { data, error } = await supabase
      .from('marks')
      .select('*, user_id (name, roll_no)')
      .order('test_no');

    if (error) {
      enqueueSnackbar('Failed to fetch marks', { variant: 'error' });
    } else {
      setMarksData(data);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, roll_no')
      .eq('role', 'Student');

    if (!error) setStudents(data);
  };

  const handleDialogOpen = () => {
    setEditingEntry(null);
    setNewEntry({ user_id: '', subject: '', test_no: '', marks: '', total_marks: '' });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = async () => {
    const { user_id, subject, test_no, marks, total_marks } = newEntry;
    if (!user_id || !subject || !test_no || !marks || !total_marks) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('marks')
          .update(newEntry)
          .eq('id', editingEntry.id);

        if (error) throw error;
        enqueueSnackbar('Marks updated successfully', { variant: 'success' });
      } else {
        const { error } = await supabase
          .from('marks')
          .insert([newEntry]);

        if (error) throw error;
        enqueueSnackbar('New marks added successfully', { variant: 'success' });
      }
      fetchMarks();
      handleDialogClose();
    } catch (err) {
      enqueueSnackbar('Error saving marks', { variant: 'error' });
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      user_id: entry.user_id.id,
      subject: entry.subject,
      test_no: entry.test_no,
      marks: entry.marks,
      total_marks: entry.total_marks,
    });
    setOpenDialog(true);
  };

  const handleDeleteEntry = async (id) => {
    const { error } = await supabase.from('marks').delete().eq('id', id);
    if (error) {
      enqueueSnackbar('Error deleting entry', { variant: 'error' });
    } else {
      enqueueSnackbar('Marks deleted successfully', { variant: 'success' });
      fetchMarks();
    }
  };

  const filteredMarksData = marksData.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.user_id?.name?.toLowerCase().includes(query) ||
      entry.user_id?.roll_no?.toLowerCase().includes(query) ||
      entry.subject.toLowerCase().includes(query) ||
      entry.test_no.toString().includes(query)
    );
  });

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', padding: { xs: 2, sm: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary">Marks</Typography>
        {(user.role === 'Admin' || user.role === 'SuperAdmin' || user.role === 'Teacher') && (
          <Button variant="contained" color="primary" onClick={handleDialogOpen}>
            Add New Marks
          </Button>
        )}
      </Stack>

      <TextField
        label="Search..."
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4, backgroundColor: '#fff', borderRadius: 1 }}
      />

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Student Name</strong></TableCell>
              <TableCell><strong>Roll Number</strong></TableCell>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell><strong>Test No</strong></TableCell>
              <TableCell><strong>Marks</strong></TableCell>
              <TableCell><strong>Total Marks</strong></TableCell>
              <TableCell><strong>Percentage</strong></TableCell>
              {(user.role === 'Admin' || user.role === 'SuperAdmin' || user.role === 'Teacher') && (
                <TableCell><strong>Actions</strong></TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMarksData.map((entry) => {
              const percentage = ((Number(entry.marks) / Number(entry.total_marks)) * 100).toFixed(1);
              return (
                <TableRow key={entry.id}>
                  <TableCell>{entry.user_id?.name || '-'}</TableCell>
                  <TableCell>{entry.user_id?.roll_no || '-'}</TableCell>
                  <TableCell>{entry.subject}</TableCell>
                  <TableCell>{entry.test_no}</TableCell>
                  <TableCell>{entry.marks}</TableCell>
                  <TableCell>{entry.total_marks}</TableCell>
                  <TableCell>{isNaN(percentage) ? '-' : `${percentage}%`}</TableCell>
                  {(user.role === 'Admin' || user.role === 'SuperAdmin' || user.role === 'Teacher') && (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => handleEditEntry(entry)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDeleteEntry(entry.id)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {filteredMarksData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">No data found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingEntry ? 'Edit Marks' : 'Add New Marks'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Student"
              value={newEntry.user_id}
              onChange={(e) => setNewEntry({ ...newEntry, user_id: e.target.value })}
              fullWidth
            >
              {students.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name} ({s.roll_no})</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Subject"
              value={newEntry.subject}
              onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
              fullWidth
            />
            <TextField
              label="Test Number"
              value={newEntry.test_no}
              onChange={(e) => setNewEntry({ ...newEntry, test_no: e.target.value })}
              fullWidth
            />
            <TextField
              label="Marks Obtained"
              type="number"
              value={newEntry.marks}
              onChange={(e) => setNewEntry({ ...newEntry, marks: e.target.value })}
              fullWidth
            />
            <TextField
              label="Total Marks"
              type="number"
              value={newEntry.total_marks}
              onChange={(e) => setNewEntry({ ...newEntry, total_marks: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveEntry}>
            {editingEntry ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Marks;
