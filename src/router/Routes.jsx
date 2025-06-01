import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Attendance from '../pages/Attendance';
import Marks from '../pages/Marks';
import StudyMaterials from '../pages/StudyMaterials';
import Login from '../pages/Login';
import Users from '../pages/Users';
import ProtectedRoute from '../components/ProtectedRoute';
import Fees from '../pages/Fees';
import Salaries from '../pages/Salaries';
import FeesSalariesAdmin from '../pages/FeesSalariesAdmin';
import Register from '../pages/Register';
import Layout from '../components/Layout';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private - all wrapped in Layout */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marks"
          element={
            <ProtectedRoute>
              <Marks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studymaterials"
          element={
            <ProtectedRoute>
              <StudyMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['Admin', 'SuperAdmin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees"
          element={
            <ProtectedRoute roles={['Student']}>
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salaries"
          element={
            <ProtectedRoute roles={['Teacher']}>
              <Salaries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fees-salaries"
          element={
            <ProtectedRoute roles={['Admin', 'SuperAdmin']}>
              <FeesSalariesAdmin />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;
