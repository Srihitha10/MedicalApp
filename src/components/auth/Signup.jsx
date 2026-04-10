import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import "./Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
    doctorID: "",
  });

  // UI states
  const [userType, setUserType] = useState(null); // "patient" or "doctor"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password strength if the password field is changed
    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(
        formData.password,
      )
    ) {
      errors.password =
        "Password must include letters, numbers, and special characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Doctor-specific validation
    if (userType === "doctor") {
      if (!formData.hospitalName.trim()) {
        errors.hospitalName = "Hospital name is required for doctors";
      }
      if (!formData.doctorID.trim()) {
        errors.doctorID = "Doctor ID is required";
      }
    }

    if (!agreeToTerms) {
      errors.terms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        const payload = {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: userType === "doctor" ? "doctor" : "user",
        };

        // Add doctor-specific fields if doctor
        if (userType === "doctor") {
          payload.hospitalName = formData.hospitalName;
          payload.doctorID = formData.doctorID;
        }

        // Send data to the backend API
        const response = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Registration failed");
        }

        const userData = await response.json();

        const sessionUser = {
          _id: userData.patientId,
          dbUserId: userData._id,
          patientId: userData.patientId,
          doctorPublicId: userData.doctorPublicId,
          email: userData.email,
          displayName: userData.name,
          role: userData.role || "user",
        };

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(sessionUser));
        localStorage.setItem("isAuthenticated", "true");

        // Navigate to appropriate dashboard after signup
        navigate(userType === "doctor" ? "/doctor-dashboard" : "/dashboard", {
          replace: true,
        });
      } catch (error) {
        console.error("Registration error:", error);
        setFormErrors({
          submit: error.message || "Registration failed. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPasswordStrengthPercentage = () => {
    const { length, hasLetter, hasNumber, hasSpecial } = passwordStrength;
    const criteria = [length, hasLetter, hasNumber, hasSpecial];
    const metCriteria = criteria.filter(Boolean).length;
    return (metCriteria / criteria.length) * 100;
  };

  const getPasswordStrengthText = () => {
    const percentage = getPasswordStrengthPercentage();
    if (percentage === 0) return "";
    if (percentage <= 25) return "Weak";
    if (percentage <= 50) return "Fair";
    if (percentage <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    const percentage = getPasswordStrengthPercentage();
    if (percentage <= 25) return "#ff4d4f";
    if (percentage <= 50) return "#faad14";
    if (percentage <= 75) return "#52c41a";
    return "#1890ff";
  };

  return (
    <div className="signup-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="signup-modal"
      >
        <button className="close-button" onClick={() => navigate("/")}>
          <FiX size={20} />
        </button>

        <h1 className="signup-title">Create Your Account</h1>

        {/* Role Selection - Show only if no role selected yet */}
        {!userType && (
          <div className="role-selection">
            <p className="role-prompt">
              Are you signing up as a Patient or Doctor?
            </p>
            <div className="role-buttons">
              <button
                type="button"
                className="role-btn patient-btn"
                onClick={() => setUserType("patient")}
              >
                👤 Patient
              </button>
              <button
                type="button"
                className="role-btn doctor-btn"
                onClick={() => setUserType("doctor")}
              >
                👨‍⚕️ Doctor
              </button>
            </div>
          </div>
        )}

        {/* Form - Show only after role is selected */}
        {userType && (
          <>
            {/* Change role button */}
            <button
              type="button"
              className="change-role-btn"
              onClick={() => setUserType(null)}
            >
              ← Change role
            </button>

            {formErrors.submit && (
              <div className="error-banner">{formErrors.submit}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className={`form-input ${
                    formErrors.fullName ? "input-error" : ""
                  }`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {formErrors.fullName && (
                  <p className="error-text">{formErrors.fullName}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${formErrors.email ? "input-error" : ""}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formErrors.email && (
                  <p className="error-text">{formErrors.email}</p>
                )}
              </div>

              {/* Doctor-specific fields */}
              {userType === "doctor" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Hospital Name</label>
                    <input
                      type="text"
                      name="hospitalName"
                      className={`form-input ${
                        formErrors.hospitalName ? "input-error" : ""
                      }`}
                      placeholder="Enter hospital name"
                      value={formData.hospitalName}
                      onChange={handleChange}
                    />
                    {formErrors.hospitalName && (
                      <p className="error-text">{formErrors.hospitalName}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Doctor ID / License Number
                    </label>
                    <input
                      type="text"
                      name="doctorID"
                      className={`form-input ${
                        formErrors.doctorID ? "input-error" : ""
                      }`}
                      placeholder="Enter your doctor ID or license number"
                      value={formData.doctorID}
                      onChange={handleChange}
                    />
                    {formErrors.doctorID && (
                      <p className="error-text">{formErrors.doctorID}</p>
                    )}
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`form-input ${
                      formErrors.password ? "input-error" : ""
                    }`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div
                        className="strength-meter-fill"
                        style={{
                          width: `${getPasswordStrengthPercentage()}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      ></div>
                    </div>
                    <span
                      className="strength-text"
                      style={{ color: getPasswordStrengthColor() }}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                <div className="password-requirements">
                  <p
                    className={`requirement ${
                      passwordStrength.length ? "met" : ""
                    }`}
                  >
                    ✓ At least 8 characters
                  </p>
                  <p
                    className={`requirement ${
                      passwordStrength.hasLetter ? "met" : ""
                    }`}
                  >
                    ✓ Contains letters
                  </p>
                  <p
                    className={`requirement ${
                      passwordStrength.hasNumber ? "met" : ""
                    }`}
                  >
                    ✓ Contains numbers
                  </p>
                  <p
                    className={`requirement ${
                      passwordStrength.hasSpecial ? "met" : ""
                    }`}
                  >
                    ✓ Contains special characters
                  </p>
                </div>
                {formErrors.password && (
                  <p className="error-text">{formErrors.password}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className={`form-input ${
                      formErrors.confirmPassword ? "input-error" : ""
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="error-text">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div
                className={`terms-checkbox ${
                  formErrors.terms ? "terms-error" : ""
                }`}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={() => setAgreeToTerms(!agreeToTerms)}
                />
                <label htmlFor="terms">
                  I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                  <Link to="/privacy">Privacy Policy</Link>
                </label>
              </div>
              {formErrors.terms && (
                <p className="error-text terms-error-text">
                  {formErrors.terms}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`submit-button ${isLoading ? "loading" : ""}`}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>

              <p className="login-link">
                Already have an account? <Link to="/login">Log In</Link>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Signup;
