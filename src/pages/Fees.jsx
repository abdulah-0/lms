import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { getStudentFees, downloadChallan } from '../api';
import { useAuth } from '../components/AuthContext';
import { useSnackbar } from 'notistack';

export default function Fees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    async function fetchFees() {
      setLoading(true);
      try {
        const res = await getStudentFees(user._id);
        setFees(res.data);
      } catch (err) {
        enqueueSnackbar('Failed to fetch fees', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchFees();
  }, [user, enqueueSnackbar]);

  const handleDownload = async (feeId) => {
    try {
      const res = await downloadChallan(feeId);
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
        My Fees
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, width: '100%', overflowX: 'auto', backgroundColor: '#fff' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Challan</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee._id}>
                <TableCell>{fee.amount}</TableCell>
                <TableCell>{fee.dueDate ? fee.dueDate.slice(0, 10) : '-'}</TableCell>
                <TableCell>
                  <Chip label={fee.status} color={fee.status === 'Paid' ? 'success' : 'warning'} />
                </TableCell>
                <TableCell>
                  {fee.challanUrl ? (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(fee._id)}
                    >
                      Download
                    </Button>
                  ) : (
                    <Typography variant="body2" color="textSecondary">N/A</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {fees.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No fee records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 