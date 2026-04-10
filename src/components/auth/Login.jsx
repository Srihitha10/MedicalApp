import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isDoctorLogin, setIsDoctorLogin] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const adminEmail = "admin@medsecure.com";
      const adminPassword = "admin123";

      if (isAdminLogin) {
        if (email === adminEmail && password === adminPassword) {
          const userData = {
            _id: "admin001",
            patientId: "0000",
            email: email,
            displayName: "Admin",
            role: "admin",
          };
          login(userData);
          toast.success("Admin login successful!");
          navigate("/admin-dashboard");
        } else {
          setError("Invalid admin credentials.");
        }
        return;
      }

      const expectedRole = isDoctorLogin ? "doctor" : "user";
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          expectedRole,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Login failed");
      }

      const userData = {
        _id: payload.patientId,
        dbUserId: payload._id,
        patientId: payload.patientId,
        doctorPublicId: payload.doctorPublicId,
        email: payload.email,
        displayName: payload.name,
        role: payload.role,
      };

      login(userData);
      toast.success("Login successful!");
      navigate(isDoctorLogin ? "/doctor-dashboard" : "/dashboard");
    } catch (error) {
      setError(
        error.message || "Failed to sign in. Please check your credentials.",
      );
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign In to Your Account</h2>

        <div className="login-type-toggle">
          <button
            className={`toggle-btn ${
              !isAdminLogin && !isDoctorLogin ? "active" : ""
            }`}
            onClick={() => {
              setIsAdminLogin(false);
              setIsDoctorLogin(false);
            }}
            type="button"
          >
            User Login
          </button>
          <button
            className={`toggle-btn ${isAdminLogin ? "active" : ""}`}
            onClick={() => {
              setIsAdminLogin(true);
              setIsDoctorLogin(false);
            }}
            type="button"
          >
            Admin Login
          </button>
          <button
            className={`toggle-btn ${isDoctorLogin ? "active" : ""}`}
            onClick={() => {
              setIsDoctorLogin(true);
              setIsAdminLogin(false);
            }}
            type="button"
          >
            Doctor Login
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isAdminLogin && (
          <div className="info-message">
            <strong>Demo Admin Credentials:</strong>
            <p>Email: admin@medsecure.com</p>
            <p>Password: admin123</p>
          </div>
        )}

        {isDoctorLogin && (
          <div className="info-message">
            <strong>Doctor Login:</strong>
            <p>Use a registered doctor account email and password.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
          <Link to="/" className="back-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
