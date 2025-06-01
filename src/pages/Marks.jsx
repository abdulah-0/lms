import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useSnackbar } from 'notistack';

function Marks() {
  const [marksData, setMarksData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    name: '',
    rollNo: '',
    subject: '',
    testNo: '',
    marks: '',
    totalMarks: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const handleDialogOpen = () => {
    setEditingEntry(null);
    setNewEntry({
      name: '',
      rollNo: '',
      subject: '',
      testNo: '',
      marks: '',
      totalMarks: '',
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = () => {
    if (!newEntry.name || !newEntry.rollNo || !newEntry.subject || !newEntry.testNo || !newEntry.marks || !newEntry.totalMarks) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }

    if (editingEntry) {
      const updatedData = marksData.map((entry) =>
        entry.id === editingEntry.id ? { ...newEntry, id: editingEntry.id } : entry
      );
      setMarksData(updatedData);
      enqueueSnackbar('Marks updated successfully', { variant: 'success' });
    } else {
      setMarksData([...marksData, { ...newEntry, id: Date.now() }]);
      enqueueSnackbar('New marks added successfully', { variant: 'success' });
    }
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry);
    setOpenDialog(true);
  };

  const handleDeleteEntry = (id) => {
    setMarksData(marksData.filter((entry) => entry.id !== id));
    enqueueSnackbar('Marks deleted successfully', { variant: 'success' });
  };

  const handleSaveMarks = () => {
    console.log('Saved Marks:', marksData);
    enqueueSnackbar('All marks saved successfully!', { variant: 'success' });
  };

  // Filter Marks Data Based on Search Query
  const filteredMarksData = marksData.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.name.toLowerCase().includes(query) ||
      entry.rollNo.toLowerCase().includes(query) ||
      entry.subject.toLowerCase().includes(query) ||
      entry.testNo.toString().includes(query)
    );
  });

  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        minHeight: '100vh',
        padding: { xs: 2, sm: 4 },
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="primary">
          Marks
        </Typography>
        <Button variant="contained" color="primary" onClick={handleDialogOpen}>
          Add New Marks
        </Button>
      </Stack>

      {/* Search Bar */}
      <TextField
        label="Search..."
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4, backgroundColor: '#fff', borderRadius: 1 }}
      />

      {/* Marks Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          width: '100%',
          overflowX: 'auto',
          backgroundColor: '#fff',
        }}
      >
        <Table sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Student Name</strong></TableCell>
              <TableCell><strong>Roll Number</strong></TableCell>
              <TableCell><strong>Subject</strong></TableCell>
              <TableCell><strong>Test No</strong></TableCell>
              <TableCell><strong>Marks</strong></TableCell>
              <TableCell><strong>Total Marks</strong></TableCell>
              <TableCell><strong>Percentage</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMarksData.map((entry) => {
              const percentage = ((Number(entry.marks) / Number(entry.totalMarks)) * 100).toFixed(1);
              return (
                <TableRow key={entry.id}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.rollNo}</TableCell>
                  <TableCell>{entry.subject}</TableCell>
                  <TableCell>{entry.testNo}</TableCell>
                  <TableCell>{entry.marks}</TableCell>
                  <TableCell>{entry.totalMarks}</TableCell>
                  <TableCell>{isNaN(percentage) ? '-' : `${percentage}%`}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEditEntry(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save Button */}
      <Stack direction="row" justifyContent="flex-end" mt={4}>
        <Button variant="contained" color="success" onClick={handleSaveMarks}>
          Save Marks
        </Button>
      </Stack>

      {/* Add/Edit Marks Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingEntry ? 'Edit Marks' : 'Add New Marks'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Student Name"
              value={newEntry.name}
              onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Roll Number"
              value={newEntry.rollNo}
              onChange={(e) => setNewEntry({ ...newEntry, rollNo: e.target.value })}
              fullWidth
            />
            <TextField
              label="Subject"
              value={newEntry.subject}
              onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
              fullWidth
            />
            <TextField
              label="Test Number"
              value={newEntry.testNo}
              onChange={(e) => setNewEntry({ ...newEntry, testNo: e.target.value })}
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
              value={newEntry.totalMarks}
              onChange={(e) => setNewEntry({ ...newEntry, totalMarks: e.target.value })}
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
