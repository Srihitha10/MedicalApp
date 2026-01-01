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

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setTimeout(() => {
        const adminEmail = "admin@medsecure.com";
        const adminPassword = "admin123";

        if (isAdminLogin) {
          if (email === adminEmail && password === adminPassword) {
            const userData = {
              _id: "admin001",
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
        } else {
          // Regular user login - USE EMAIL AS CONSISTENT ID
          const userId = "user_" + email.replace(/[^a-z0-9]/gi, "_"); // Consistent ID based on email
          const userData = {
            _id: userId,
            email: email,
            displayName: email.split("@")[0],
            role: "user",
          };
          login(userData);
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      }, 1000);
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
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
            className={`toggle-btn ${!isAdminLogin ? "active" : ""}`}
            onClick={() => setIsAdminLogin(false)}
            type="button"
          >
            User Login
          </button>
          <button
            className={`toggle-btn ${isAdminLogin ? "active" : ""}`}
            onClick={() => setIsAdminLogin(true)}
            type="button"
          >
            Admin Login
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
