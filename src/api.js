// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attendance APIs
export const getAttendance    = () => api.get('/attendance');
export const addAttendance    = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);

// Marks APIs
export const getMarks      = () => api.get('/marks');
export const updateMarks   = (id, data) => api.put(`/marks/${id}`, data);
export const deleteMarks   = (id) => api.delete(`/marks/${id}`);

// Study Materials APIs
export const getMaterials  = () => api.get('/materials');
export const addMaterial   = (data) => api.post('/materials', data);
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

// Auth APIs
export const loginUser = (email, password) => api.post('/users/login', { email, password });

// User Management APIs
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const addUser = (data) => api.post('/users/register', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Fees APIs
export const getStudentFees = (studentId) => api.get(`/fees/student/${studentId}`);
export const downloadChallan = (feeId) => api.get(`/fees/download/${feeId}`, { responseType: 'blob' });

// Salaries APIs
export const getTeacherSalaries = (teacherId) => api.get(`/salaries/teacher/${teacherId}`);
export const downloadSlip = (salaryId) => api.get(`/salaries/download/${salaryId}`, { responseType: 'blob' });

// Admin Fees APIs
export const getAllFees = () => api.get('/fees');
export const addFee = (data) => api.post('/fees', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateFee = (id, data) => api.put(`/fees/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteFee = (id) => api.delete(`/fees/${id}`);

// Admin Salaries APIs
export const getAllSalaries = () => api.get('/salaries');
export const addSalary = (data) => api.post('/salaries', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSalary = (id, data) => api.put(`/salaries/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteSalary = (id) => api.delete(`/salaries/${id}`);

// Public Registration API
export const registerPublicUser = (data) => api.post('/users/register', data);
// Superadmin Approve User API
export const approveUser = (id, role) => api.put(`/users/approve/${id}`, { role });

export default api;
