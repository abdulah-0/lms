// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { getAttendance, getMarks, getMaterials, getUsers } from '../api';
import { useAuth } from '../components/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (user.role === 'Admin') {
          // Admin: total users by role, avg attendance, total materials
          const [usersRes, attendanceRes, materialsRes] = await Promise.all([
            getUsers(),
            getAttendance(),
            getMaterials(),
          ]);
          const users = usersRes.data;
          const attendance = attendanceRes.data;
          const materials = materialsRes.data;
          const totalStudents = users.filter(u => u.role === 'Student').length;
          const totalTeachers = users.filter(u => u.role === 'Teacher').length;
          const totalAdmins = users.filter(u => u.role === 'Admin').length;
          const avgAttendance =
            attendance.length > 0
              ? Math.round(
                  (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100
                )
              : 0;
          setStats({
            totalStudents,
            totalTeachers,
            totalAdmins,
            avgAttendance,
            totalMaterials: materials.length,
            recentMaterials: materials.slice(0, 5),
          });
        } else {
          // Student/Teacher: personal stats
          const [attendanceRes, marksRes, materialsRes] = await Promise.all([
            getAttendance(),
            getMarks(),
            getMaterials(),
          ]);
          // Attendance: filter by user
          const myAttendance = attendanceRes.data.filter(a => a.userId === user._id);
          const presentCount = myAttendance.filter(a => a.status === 'Present').length;
          const attendancePct = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;
          // Marks: filter by user
          const myMarks = marksRes.data.filter(m => m.studentId === user._id);
          const avgScore = myMarks.length > 0 ? Math.round(myMarks.reduce((sum, m) => sum + m.score, 0) / myMarks.length) : 0;
          const maxScore = myMarks.length > 0 ? Math.max(...myMarks.map(m => m.score)) : 0;
          const minScore = myMarks.length > 0 ? Math.min(...myMarks.map(m => m.score)) : 0;
          // Materials: public only
          const myMaterials = materialsRes.data.filter(m => m.public);
          setStats({
            attendancePct,
            avgScore,
            maxScore,
            minScore,
            totalMaterials: myMaterials.length,
          });
        }
      } catch (err) {
        // eslint-disable-next-line
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary">
        Welcome, {user.name}!
      </Typography>
      {user.role === 'Admin' ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">{stats.totalStudents}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Teachers
              </Typography>
              <Typography variant="h4">{stats.totalTeachers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Admins
              </Typography>
              <Typography variant="h4">{stats.totalAdmins}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Avg. Attendance
              </Typography>
              <Typography variant="h4">{stats.avgAttendance}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Study Materials
              </Typography>
              <Typography variant="h4">{stats.totalMaterials}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Recent Study Materials
              </Typography>
              {stats.recentMaterials && stats.recentMaterials.length > 0 ? (
                <ul>
                  {stats.recentMaterials.map((m) => (
                    <li key={m._id}>{m.title} ({m.fileType})</li>
                  ))}
                </ul>
              ) : (
                <Typography>No recent materials.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Your Attendance
              </Typography>
              <Typography variant="h4">{stats.attendancePct}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Your Average Score
              </Typography>
              <Typography variant="h4">{stats.avgScore}</Typography>
              <Typography variant="body2" color="textSecondary">
                Max: {stats.maxScore} | Min: {stats.minScore}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Study Materials
              </Typography>
              <Typography variant="h4">{stats.totalMaterials}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
