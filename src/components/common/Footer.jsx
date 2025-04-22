import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Footer.css"; // Import the CSS file for styling

const Footer = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showFooter, setShowFooter] = useState(false);

  // Define paths where footer should not be shown at all
  const hiddenPaths = [
    "/login",
    "/signin",
    "/signup",
    "/dashboard",
    "/features",
    "/how-it-works",
  ];

  // Determine if we should render the footer at all
  const shouldRenderFooter = !hiddenPaths.includes(currentPath);

  useEffect(() => {
    // Only add scroll listener on home page
    if (currentPath !== "/") {
      // On pages other than home (that aren't in hiddenPaths), always show footer
      setShowFooter(shouldRenderFooter);
      return;
    }

    // Use debounce to prevent constant recalculation
    let scrollTimeout;

    const handleScroll = () => {
      // Clear the previous timeout
      clearTimeout(scrollTimeout);

      // Set a new timeout
      scrollTimeout = setTimeout(() => {
        // Check if we're at the bottom of the page
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop =
          document.documentElement.scrollTop || window.pageYOffset;

        // Show footer when scrolled to bottom with some padding (50px)
        const isAtBottom = scrollTop + windowHeight >= documentHeight - 50;

        // Only update state if there's a change (prevents unnecessary re-renders)
        if (isAtBottom !== showFooter) {
          setShowFooter(isAtBottom);
        }
      }, 100); // Wait 100ms after scroll stops before calculating
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentPath, shouldRenderFooter, showFooter]);

  // If we shouldn't render footer at all, return null
  if (!shouldRenderFooter) {
    return null;
  }

  // If we should render but it's hidden, use CSS to hide it
  const footerStyle = {
    display: showFooter ? "block" : "none",
    opacity: showFooter ? "1" : "0",
    transition: "opacity 0.3s ease", // Smooth transition when showing/hiding
  };

  return (
    <footer className="site-footer" style={footerStyle}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>MedSecure</h3>
          <p>
            Secure your medical records with blockchain technology. Take control
            of your health data with our decentralized platform.
          </p>
          <div className="social-links">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-github"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/how-it-works">How It Works</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/support">Support</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: contact@medsecure.com</p>
          <p>Phone: +1 (123) 456-7890</p>
          <p>
            Address: 123 Blockchain Way,
            <br />
            Secure City, SC 12345
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 MedSecure. All rights reserved.</p>
        <p>Built with security and privacy in mind.</p>
      </div>
    </footer>
  );
};

export default Footer;
