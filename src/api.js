// src/api.js
import { supabase } from './supabaseClient';

// ---------------- AUTH ----------------

export const loginUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const registerUser = async (form) => {
  const { email, password, ...metadata } = form;
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // e.g., name, role, etc.
    },
  });
};

// ---------------- USERS ----------------

export const getUsers = async () => {
  return await supabase.from('users').select('*');
};

export const getUser = async (id) => {
  return await supabase.from('users').select('*').eq('id', id).single();
};

export const addUser = async (data) => {
  return await supabase.from('users').insert([data]);
};

export const updateUser = async (id, data) => {
  return await supabase.from('users').update(data).eq('id', id);
};

export const deleteUser = async (id) => {
  return await supabase.from('users').delete().eq('id', id);
};

export const approveUser = async (id, role) => {
  return await supabase.from('users').update({ approved: true, role }).eq('id', id);
};

// ---------------- ATTENDANCE ----------------

export const getAttendance = async () => {
  return await supabase.from('attendance').select('*, user_id (name, role)');
};

export const addAttendance = async (data) => {
  return await supabase.from('attendance').insert([data]);
};

export const updateAttendance = async (id, data) => {
  return await supabase.from('attendance').update(data).eq('id', id);
};

export const deleteAttendance = async (id) => {
  return await supabase.from('attendance').delete().eq('id', id);
};

// ---------------- MARKS ----------------

export const getMarks = async () => {
  return await supabase.from('marks').select('*');
};

export const addMark = async (data) => {
  return await supabase.from('marks').insert([data]);
};

export const updateMarks = async (id, data) => {
  return await supabase.from('marks').update(data).eq('id', id);
};

export const deleteMarks = async (id) => {
  return await supabase.from('marks').delete().eq('id', id);
};

// ---------------- STUDY MATERIALS ----------------

export const getMaterials = async () => {
  return await supabase.from('study_materials').select('*');
};

export const addMaterial = async (data) => {
  return await supabase.from('study_materials').insert([data]);
};

export const deleteMaterial = async (id) => {
  return await supabase.from('study_materials').delete().eq('id', id);
};

// Supabase Storage upload is done directly in the component

// ---------------- FEES ----------------

export const getAllFees = async () => {
  return await supabase.from('fees').select('*');
};

export const getStudentFees = async (studentId) => {
  return await supabase.from('fees').select('*').eq('student_id', studentId);
};

export const addFee = async (data) => {
  return await supabase.from('fees').insert([data]);
};

export const updateFee = async (id, data) => {
  return await supabase.from('fees').update(data).eq('id', id);
};

export const deleteFee = async (id) => {
  return await supabase.from('fees').delete().eq('id', id);
};

// ---------------- SALARIES ----------------

export const getAllSalaries = async () => {
  return await supabase.from('salaries').select('*');
};

export const getTeacherSalaries = async (teacherId) => {
  return await supabase.from('salaries').select('*').eq('teacher_id', teacherId);
};

export const addSalary = async (data) => {
  return await supabase.from('salaries').insert([data]);
};

export const updateSalary = async (id, data) => {
  return await supabase.from('salaries').update(data).eq('id', id);
};

export const deleteSalary = async (id) => {
  return await supabase.from('salaries').delete().eq('id', id);
};

// ---------------- FILE DOWNLOAD HELPERS ----------------

export const downloadChallan = async (path) => {
  return supabase.storage.from('materials').download(path);
};

export const downloadSlip = async (path) => {
  return supabase.storage.from('materials').download(path);
};

export default supabase;
