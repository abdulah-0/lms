// src/pages/FeesSalariesAdmin.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Stack, InputLabel, Select, FormControl
} from '@mui/material';
import { Add, Edit, Delete, Download as DownloadIcon, UploadFile } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { useSnackbar } from 'notistack';

const BUCKET_NAME = 'materials';

export default function FeesSalariesAdmin() {
  const [tab, setTab] = useState(0);
  const [fees, setFees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [users, setUsers] = useState([]);
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [feeEdit, setFeeEdit] = useState(null);
  const [salaryEdit, setSalaryEdit] = useState(null);
  const [feeForm, setFeeForm] = useState({
    student_id: '', amount: '', due_date: '', status: 'Pending', file: null
  });
  const [salaryForm, setSalaryForm] = useState({
    teacher_id: '', month: '', amount: '', status: 'Pending', file: null
  });
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [userRes, feeRes, salaryRes] = await Promise.all([
      supabase.from('users').select('id, name, role'),
      supabase.from('fees').select('*'),
      supabase.from('salaries').select('*')
    ]);
    if (userRes.error || feeRes.error || salaryRes.error) {
      enqueueSnackbar('Error loading data', { variant: 'error' });
    } else {
      setUsers(userRes.data);
      setFees(feeRes.data);
      setSalaries(salaryRes.data);
    }
    setLoading(false);
  };

  const handleChangeTab = (_, newValue) => setTab(newValue);

  const openFeeDialog = (fee = null) => {
    setFeeEdit(fee);
    setFeeForm(fee ? { ...fee, file: null, due_date: fee.due_date?.slice(0, 10) } : {
      student_id: '', amount: '', due_date: '', status: 'Pending', file: null
    });
    setFeeDialogOpen(true);
  };

  const openSalaryDialog = (salary = null) => {
    setSalaryEdit(salary);
    setSalaryForm(salary ? { ...salary, file: null } : {
      teacher_id: '', month: '', amount: '', status: 'Pending', file: null
    });
    setSalaryDialogOpen(true);
  };

  const closeFeeDialog = () => setFeeDialogOpen(false);
  const closeSalaryDialog = () => setSalaryDialogOpen(false);

  const handleFeeFormChange = (e) => {
    const { name, value, files } = e.target;
    setFeeForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSalaryFormChange = (e) => {
    const { name, value, files } = e.target;
    setSalaryForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleFeeSubmit = async () => {
    if (!feeForm.student_id || !feeForm.amount || !feeForm.due_date) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }
    let challan_url = feeEdit?.challan_url || null;
    if (feeForm.file) {
      const filename = `${Date.now()}_${feeForm.file.name}`;
      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filename, feeForm.file);
      if (error) return enqueueSnackbar('Upload failed', { variant: 'error' });
      challan_url = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path).data.publicUrl;
    }
    const payload = { ...feeForm, challan_url };
    delete payload.file;
    const res = feeEdit
      ? await supabase.from('fees').update(payload).eq('id', feeEdit.id)
      : await supabase.from('fees').insert([payload]);
    if (res.error) enqueueSnackbar('Failed to save fee', { variant: 'error' });
    else {
      enqueueSnackbar(feeEdit ? 'Fee updated' : 'Fee added', { variant: 'success' });
      fetchAll();
      closeFeeDialog();
    }
  };

  const handleSalarySubmit = async () => {
    if (!salaryForm.teacher_id || !salaryForm.month || !salaryForm.amount) {
      enqueueSnackbar('Please fill all fields', { variant: 'warning' });
      return;
    }
    let slip_url = salaryEdit?.slip_url || null;
    if (salaryForm.file) {
      const filename = `${Date.now()}_${salaryForm.file.name}`;
      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filename, salaryForm.file);
      if (error) return enqueueSnackbar('Upload failed', { variant: 'error' });
      slip_url = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path).data.publicUrl;
    }
    const payload = { ...salaryForm, slip_url };
    delete payload.file;
    const res = salaryEdit
      ? await supabase.from('salaries').update(payload).eq('id', salaryEdit.id)
      : await supabase.from('salaries').insert([payload]);
    if (res.error) enqueueSnackbar('Failed to save salary', { variant: 'error' });
    else {
      enqueueSnackbar(salaryEdit ? 'Salary updated' : 'Salary added', { variant: 'success' });
      fetchAll();
      closeSalaryDialog();
    }
  };

  const handleFeeDelete = async (id) => {
    if (!window.confirm('Delete this fee?')) return;
    await supabase.from('fees').delete().eq('id', id);
    enqueueSnackbar('Fee deleted', { variant: 'success' });
    fetchAll();
  };

  const handleSalaryDelete = async (id) => {
    if (!window.confirm('Delete this salary?')) return;
    await supabase.from('salaries').delete().eq('id', id);
    enqueueSnackbar('Salary deleted', { variant: 'success' });
    fetchAll();
  };

  const handleDownload = async (urlPath, filename) => {
    const filePath = urlPath.split('/').slice(-1)[0];
    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(filePath);
    if (error) return enqueueSnackbar('Download failed', { variant: 'error' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = filename;
    link.click();
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', p: 4 }}>
      <Typography variant="h4" mb={2}>Fees & Salaries Management</Typography>
      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label="Fees" />
        <Tab label="Salaries" />
      </Tabs>

      {tab === 0 && (
        <>
          <Button variant="contained" onClick={() => openFeeDialog()} sx={{ mb: 2 }}>Add Fee</Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>Student</TableCell><TableCell>Amount</TableCell><TableCell>Due Date</TableCell><TableCell>Status</TableCell><TableCell>Challan</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{users.find(u => u.id === fee.student_id)?.name || 'Unknown'}</TableCell>
                    <TableCell>{fee.amount}</TableCell>
                    <TableCell>{fee.due_date?.slice(0, 10)}</TableCell>
                    <TableCell><Chip label={fee.status} color={fee.status === 'Paid' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>
                      {fee.challan_url
                        ? <IconButton onClick={() => handleDownload(fee.challan_url, 'challan.pdf')}><DownloadIcon /></IconButton>
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openFeeDialog(fee)}><Edit /></IconButton>
                      <IconButton onClick={() => handleFeeDelete(fee.id)} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <>
          <Button variant="contained" onClick={() => openSalaryDialog()} sx={{ mb: 2 }}>Add Salary</Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>Teacher</TableCell><TableCell>Month</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell><TableCell>Slip</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
              <TableBody>
                {salaries.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{users.find(u => u.id === s.teacher_id)?.name || 'Unknown'}</TableCell>
                    <TableCell>{s.month}</TableCell>
                    <TableCell>{s.amount}</TableCell>
                    <TableCell><Chip label={s.status} color={s.status === 'Paid' ? 'success' : 'warning'} /></TableCell>
                    <TableCell>
                      {s.slip_url
                        ? <IconButton onClick={() => handleDownload(s.slip_url, 'salary-slip.pdf')}><DownloadIcon /></IconButton>
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => openSalaryDialog(s)}><Edit /></IconButton>
                      <IconButton onClick={() => handleSalaryDelete(s.id)} color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Fee Dialog */}
      <Dialog open={feeDialogOpen} onClose={closeFeeDialog}>
        <DialogTitle>{feeEdit ? 'Edit Fee' : 'Add Fee'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Student</InputLabel>
            <Select name="student_id" value={feeForm.student_id} onChange={handleFeeFormChange}>
              {users.filter(u => u.role === 'Student').map(u => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Amount" name="amount" value={feeForm.amount} onChange={handleFeeFormChange} fullWidth margin="normal" />
          <TextField label="Due Date" name="due_date" type="date" value={feeForm.due_date} onChange={handleFeeFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={feeForm.status} onChange={handleFeeFormChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
          <Button component="label" startIcon={<UploadFile />} sx={{ mt: 2 }}>
            Upload Challan
            <input hidden type="file" name="file" onChange={handleFeeFormChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleFeeSubmit}>{feeEdit ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Salary Dialog */}
      <Dialog open={salaryDialogOpen} onClose={closeSalaryDialog}>
        <DialogTitle>{salaryEdit ? 'Edit Salary' : 'Add Salary'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Teacher</InputLabel>
            <Select name="teacher_id" value={salaryForm.teacher_id} onChange={handleSalaryFormChange}>
              {users.filter(u => u.role === 'Teacher').map(u => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Month (YYYY-MM)" name="month" value={salaryForm.month} onChange={handleSalaryFormChange} fullWidth margin="normal" />
          <TextField label="Amount" name="amount" value={salaryForm.amount} onChange={handleSalaryFormChange} fullWidth margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={salaryForm.status} onChange={handleSalaryFormChange}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
            </Select>
          </FormControl>
          <Button component="label" startIcon={<UploadFile />} sx={{ mt: 2 }}>
            Upload Slip
            <input hidden type="file" name="file" onChange={handleSalaryFormChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSalaryDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSalarySubmit}>{salaryEdit ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}