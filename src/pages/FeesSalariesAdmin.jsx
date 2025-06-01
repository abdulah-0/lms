import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress, Stack, InputLabel, Select, FormControl
} from '@mui/material';
import { Add, Edit, Delete, Download as DownloadIcon, UploadFile } from '@mui/icons-material';
import {
  getAllFees, addFee, updateFee, deleteFee, downloadChallan,
  getAllSalaries, addSalary, updateSalary, deleteSalary, downloadSlip, getUsers
} from '../api';
import { useSnackbar } from 'notistack';

export default function FeesSalariesAdmin() {
  const [tab, setTab] = useState(0);
  // Fees state
  const [fees, setFees] = useState([]);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeEdit, setFeeEdit] = useState(null);
  const [feeForm, setFeeForm] = useState({ studentId: '', amount: '', dueDate: '', status: 'Pending', file: null });
  // Salaries state
  const [salaries, setSalaries] = useState([]);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [salaryEdit, setSalaryEdit] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ teacherId: '', amount: '', month: '', status: 'Pending', file: null });
  // Users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAll();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [feesRes, salariesRes] = await Promise.all([getAllFees(), getAllSalaries()]);
      setFees(feesRes.data);
      setSalaries(salariesRes.data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    }
  };

  // --- FEES CRUD ---
  const openFeeDialog = (fee = null) => {
    setFeeEdit(fee);
    setFeeForm(fee ? { ...fee, file: null, dueDate: fee.dueDate ? fee.dueDate.slice(0, 10) : '' } : { studentId: '', amount: '', dueDate: '', status: 'Pending', file: null });
    setFeeDialogOpen(true);
  };
  const closeFeeDialog = () => setFeeDialogOpen(false);
  const handleFeeFormChange = (e) => {
    const { name, value, files } = e.target;
    setFeeForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };
  const handleFeeSubmit = async () => {
    if (!feeForm.studentId || !feeForm.amount || !feeForm.dueDate) {
      enqueueSnackbar('Fill all required fields', { variant: 'warning' });
      return;
    }
    const formData = new FormData();
    Object.entries(feeForm).forEach(([k, v]) => v && formData.append(k, v));
    try {
      if (feeEdit) {
        await updateFee(feeEdit._id, formData);
        enqueueSnackbar('Fee updated', { variant: 'success' });
      } else {
        await addFee(formData);
        enqueueSnackbar('Fee added', { variant: 'success' });
      }
      fetchAll();
      closeFeeDialog();
    } catch (err) {
      enqueueSnackbar('Failed to save fee', { variant: 'error' });
    }
  };
  const handleFeeDelete = async (id) => {
    if (!window.confirm('Delete this fee?')) return;
    try {
      await deleteFee(id);
      enqueueSnackbar('Fee deleted', { variant: 'success' });
      fetchAll();
    } catch (err) {
      enqueueSnackbar('Failed to delete fee', { variant: 'error' });
    }
  };
  const handleFeeDownload = async (id) => {
    try {
      const res = await downloadChallan(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'challan.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      enqueueSnackbar('Failed to download challan', { variant: 'error' });
    }
  };

  // --- SALARIES CRUD ---
  const openSalaryDialog = (salary = null) => {
    setSalaryEdit(salary);
    setSalaryForm(salary ? { ...salary, file: null } : { teacherId: '', amount: '', month: '', status: 'Pending', file: null });
    setSalaryDialogOpen(true);
  };
  const closeSalaryDialog = () => setSalaryDialogOpen(false);
  const handleSalaryFormChange = (e) => {
    const { name, value, files } = e.target;
    setSalaryForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };
  const handleSalarySubmit = async () => {
    if (!salaryForm.teacherId || !salaryForm.amount || !salaryForm.month) {
      enqueueSnackbar('Fill all required fields', { variant: 'warning' });
      return;
    }
    const formData = new FormData();
    Object.entries(salaryForm).forEach(([k, v]) => v && formData.append(k, v));
    try {
      if (salaryEdit) {
        await updateSalary(salaryEdit._id, formData);
        enqueueSnackbar('Salary updated', { variant: 'success' });
      } else {
        await addSalary(formData);
        enqueueSnackbar('Salary added', { variant: 'success' });
      }
      fetchAll();
      closeSalaryDialog();
    } catch (err) {
      enqueueSnackbar('Failed to save salary', { variant: 'error' });
    }
  };
  const handleSalaryDelete = async (id) => {
    if (!window.confirm('Delete this salary?')) return;
    try {
      await deleteSalary(id);
      enqueueSnackbar('Salary deleted', { variant: 'success' });
      fetchAll();
    } catch (err) {
      enqueueSnackbar('Failed to delete salary', { variant: 'error' });
    }
  };
  const handleSalaryDownload = async (id) => {
    try {
      const res = await downloadSlip(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'salary-slip.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      enqueueSnackbar('Failed to download slip', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', padding: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" color="primary" mb={3}>
        Fees & Salaries Management
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Fees" />
        <Tab label="Salaries" />
      </Tabs>
      {tab === 0 && (
        <>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => openFeeDialog()}>
            Add Fee
          </Button>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, width: '100%', overflowX: 'auto', backgroundColor: '#fff' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Challan</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee._id}>
                    <TableCell>{fee.studentId?.name || '-'}</TableCell>
                    <TableCell>{fee.amount}</TableCell>
                    <TableCell>{fee.dueDate ? fee.dueDate.slice(0, 10) : '-'}</TableCell>
                    <TableCell>
                      <Chip label={fee.status} color={fee.status === 'Paid' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      {fee.challanUrl ? (
                        <IconButton onClick={() => handleFeeDownload(fee._id)}><DownloadIcon /></IconButton>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openFeeDialog(fee)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleFeeDelete(fee._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {fees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No fee records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Fee Dialog */}
          <Dialog open={feeDialogOpen} onClose={closeFeeDialog}>
            <DialogTitle>{feeEdit ? 'Edit Fee' : 'Add Fee'}</DialogTitle>
            <DialogContent sx={{ minWidth: 350 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Student</InputLabel>
                <Select
                  label="Student"
                  name="studentId"
                  value={feeForm.studentId}
                  onChange={handleFeeFormChange}
                >
                  {users.filter(u => u.role === 'Student').map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Amount" name="amount" value={feeForm.amount} onChange={handleFeeFormChange} fullWidth margin="normal" type="number" />
              <TextField label="Due Date" name="dueDate" value={feeForm.dueDate} onChange={handleFeeFormChange} fullWidth margin="normal" type="date" InputLabelProps={{ shrink: true }} />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select label="Status" name="status" value={feeForm.status} onChange={handleFeeFormChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
              <Button component="label" startIcon={<UploadFile />} sx={{ mt: 1 }}>
                {feeForm.file ? feeForm.file.name : 'Upload Challan'}
                <input type="file" name="file" hidden onChange={handleFeeFormChange} accept=".pdf,image/*" />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeFeeDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleFeeSubmit}>{feeEdit ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {tab === 1 && (
        <>
          <Button variant="contained" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => openSalaryDialog()}>
            Add Salary
          </Button>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, width: '100%', overflowX: 'auto', backgroundColor: '#fff' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Teacher</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Slip</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaries.map((salary) => (
                  <TableRow key={salary._id}>
                    <TableCell>{salary.teacherId?.name || '-'}</TableCell>
                    <TableCell>{salary.amount}</TableCell>
                    <TableCell>{salary.month}</TableCell>
                    <TableCell>
                      <Chip label={salary.status} color={salary.status === 'Paid' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>
                      {salary.slipUrl ? (
                        <IconButton onClick={() => handleSalaryDownload(salary._id)}><DownloadIcon /></IconButton>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openSalaryDialog(salary)}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => handleSalaryDelete(salary._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {salaries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No salary records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Salary Dialog */}
          <Dialog open={salaryDialogOpen} onClose={closeSalaryDialog}>
            <DialogTitle>{salaryEdit ? 'Edit Salary' : 'Add Salary'}</DialogTitle>
            <DialogContent sx={{ minWidth: 350 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Teacher</InputLabel>
                <Select
                  label="Teacher"
                  name="teacherId"
                  value={salaryForm.teacherId}
                  onChange={handleSalaryFormChange}
                >
                  {users.filter(u => u.role === 'Teacher').map(u => (
                    <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Amount" name="amount" value={salaryForm.amount} onChange={handleSalaryFormChange} fullWidth margin="normal" type="number" />
              <TextField label="Month (YYYY-MM)" name="month" value={salaryForm.month} onChange={handleSalaryFormChange} fullWidth margin="normal" placeholder="2024-06" />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select label="Status" name="status" value={salaryForm.status} onChange={handleSalaryFormChange}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
              <Button component="label" startIcon={<UploadFile />} sx={{ mt: 1 }}>
                {salaryForm.file ? salaryForm.file.name : 'Upload Slip'}
                <input type="file" name="file" hidden onChange={handleSalaryFormChange} accept=".pdf,image/*" />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeSalaryDialog}>Cancel</Button>
              <Button variant="contained" onClick={handleSalarySubmit}>{salaryEdit ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
} 