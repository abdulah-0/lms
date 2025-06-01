import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { getTeacherSalaries, downloadSlip } from '../api';
import { useAuth } from '../components/AuthContext';
import { useSnackbar } from 'notistack';

export default function Salaries() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchSalaries() {
      setLoading(true);
      try {
        const res = await getTeacherSalaries(user._id);
        setSalaries(res.data);
      } catch (err) {
        enqueueSnackbar('Failed to fetch salaries', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchSalaries();
  }, [user, enqueueSnackbar]);

  const handleDownload = async (salaryId) => {
    try {
      const res = await downloadSlip(salaryId);
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
        My Salaries
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, width: '100%', overflowX: 'auto', backgroundColor: '#fff' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Month</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Slip</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaries.map((salary) => (
              <TableRow key={salary._id}>
                <TableCell>{salary.amount}</TableCell>
                <TableCell>{salary.month}</TableCell>
                <TableCell>
                  <Chip label={salary.status} color={salary.status === 'Paid' ? 'success' : 'warning'} />
                </TableCell>
                <TableCell>
                  {salary.slipUrl ? (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(salary._id)}
                    >
                      Download
                    </Button>
                  ) : (
                    <Typography variant="body2" color="textSecondary">N/A</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {salaries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No salary records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 