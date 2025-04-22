import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Layout Components
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

// Public Pages
import Home from "../components/landingPage/Home";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";

// Protected Pages
import Dashboard from "../components/dashboard/Dashboard";
import MedicalRecords from "../components/dashboard/MedicalRecords";
import RecordUpload from "../components/dashboard/RecordUpload";
import AccessManagement from "../components/dashboard/AccessManagement";
import Notifications from "../components/dashboard/Notifications";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <RecordUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/access"
            element={
              <ProtectedRoute>
                <AccessManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Catch All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes;
