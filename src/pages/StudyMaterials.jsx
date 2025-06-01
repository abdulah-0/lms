import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/materials'; // ✅ Change if you deploy elsewhere

const StudyMaterials = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [materials, setMaterials] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(API_BASE);
      setMaterials(res.data);
    } catch (err) {
      enqueueSnackbar('Failed to fetch materials', { variant: 'error' });
      setMaterials([]); // Safe fallback
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUpload = async () => {
    if (!title || !description || !file) {
      enqueueSnackbar('All fields are required', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    try {
      await axios.post(API_BASE, formData);
      enqueueSnackbar('Material uploaded successfully', { variant: 'success' });
      setOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchMaterials();
    } catch (err) {
      enqueueSnackbar('Upload failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      enqueueSnackbar('Material deleted', { variant: 'success' });
      fetchMaterials();
    } catch (err) {
      enqueueSnackbar('Failed to delete material', { variant: 'error' });
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/download/${id}`, {
        responseType: 'blob',
      });

      const contentDisposition = res.headers['content-disposition'];
      const fileName = contentDisposition
        ? decodeURIComponent(contentDisposition.split('filename=')[1])
        : 'downloaded_file';

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      enqueueSnackbar('Download failed', { variant: 'error' });
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Study Materials
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Upload Material
      </Button>

      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(materials) && materials.length > 0 ? (
              materials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell>{material.title}</TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(material.fileUrl, '_blank')}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleDownload(material._id)}
                      >
                        Download
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(material._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography align="center" sx={{ my: 2 }}>
                    No study materials found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload Study Material</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: '1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudyMaterials;
