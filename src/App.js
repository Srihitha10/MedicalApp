import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Public Pages
import Home from "./components/landingPage/Home";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Features from "./components/landingPage/Features";
import HowItWorks from "./components/landingPage/HowItWorks";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Protected Pages
import Dashboard from "./components/dashboard/Dashboard";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import UploadRecordsPage from "./pages/UploadRecordsPage";
import AccessManagement from "./components/dashboard/AccessManagement";
import Notifications from "./components/dashboard/Notifications";

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />

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
                path="/medical-records"
                element={
                  <ProtectedRoute>
                    <MedicalRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-records"
                element={
                  <ProtectedRoute>
                    <UploadRecordsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/access-management"
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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer position="top-right" autoClose={3000} />
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
