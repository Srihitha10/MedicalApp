import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import { FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">MedSecure</span>
        </Link>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX /> : <FiMenu />}
        </div>

        <ul className={`navbar-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
              onClick={closeMenu}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/features"
              className={`nav-link ${isActive("/features") ? "active" : ""}`}
              onClick={closeMenu}
            >
              Features
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/how-it-works"
              className={`nav-link ${
                isActive("/how-it-works") ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              How It Works
            </Link>
          </li>

          {!currentUser ? (
            <>
              <li className="nav-item auth-item">
                <Link
                  to="/login"
                  className="nav-link login-link"
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li className="nav-item auth-item">
                <Link
                  to="/signup"
                  className="nav-link signup-link"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  to="/dashboard"
                  className={`nav-link ${
                    isActive("/dashboard") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/medical-records"
                  className={`nav-link ${
                    isActive("/medical-records") ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Medical Records
                </Link>
              </li>
              <li className="nav-item">
                <div className="notification-wrapper">
                  <NotificationBell />
                </div>
              </li>
              <li className="nav-item dropdown">
                <div className="user-profile">
                  <div className="user-avatar">
                    {currentUser.displayName
                      ? currentUser.displayName.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="dropdown-content">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/records"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      My Records
                    </Link>
                    <Link
                      to="/dashboard/access"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      Access Control
                    </Link>
                    <Link
                      to="/upload-records"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      Upload Records
                    </Link>
                    <Link
                      to="/access-management"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      Access Management
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-button"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
