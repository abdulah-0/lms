// src/pages/Fees.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, CircularProgress
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
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
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', user.id)
        .order('due_date', { ascending: true });

      if (error) {
        enqueueSnackbar('Failed to fetch fees', { variant: 'error' });
      } else {
        setFees(data);
      }
      setLoading(false);
    }

    fetchFees();
  }, [user, enqueueSnackbar]);

  const handleDownload = async (fee) => {
    try {
      const filePath = fee.challan_url?.split('/').slice(-1)[0];

      const { data, error } = await supabase
        .storage
        .from('materials')
        .download(filePath);

      if (error) {
        enqueueSnackbar('Download failed', { variant: 'error' });
        return;
      }

      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${fee.title || 'challan'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      enqueueSnackbar('Download failed', { variant: 'error' });
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
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
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
              <TableRow key={fee.id}>
                <TableCell>{fee.amount}</TableCell>
                <TableCell>{fee.due_date?.slice(0, 10)}</TableCell>
                <TableCell>
                  <Chip
                    label={fee.status}
                    color={fee.status === 'Paid' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  {fee.challan_url ? (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(fee)}
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
