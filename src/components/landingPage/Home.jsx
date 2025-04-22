import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaLock,
  FaDatabase,
  FaFileContract,
  FaClipboardList,
} from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Secure Medical Records Management</h1>
          <p>
            Store and manage your medical records securely using blockchain
            technology
          </p>
          <button onClick={handleGetStarted} className="cta-button">
            {currentUser ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <h2>How Our Platform Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaLock />
            </div>
            <h3>Secure Authentication</h3>
            <p>
              Register with multi-factor authentication and receive your unique
              blockchain identity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaDatabase />
            </div>
            <h3>Decentralized Storage</h3>
            <p>
              Your records are encrypted and stored on IPFS with only the hash
              stored on blockchain.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaFileContract />
            </div>
            <h3>Smart Contract Access</h3>
            <p>
              Grant or revoke access to your records for doctors and family
              members in real-time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaClipboardList />
            </div>
            <h3>Complete Audit Trail</h3>
            <p>
              Get notified of all access attempts with a transparent, immutable
              access log.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <h2>Simple & Secure Process</h2>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Secure Account</h3>
              <p>
                Sign up to get your unique blockchain identity. We'll generate a
                secure key pair that gives you complete control over your
                medical data.
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Upload Your Medical Records</h3>
              <p>
                Upload X-rays, test results, or any medical documents. We'll
                encrypt them and store them on IPFS, with only a reference hash
                on the blockchain.
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Manage Access Permissions</h3>
              <p>
                Decide who can see your records. Grant access to doctors or
                family members, and revoke that access anytime with a single
                click.
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Monitor Access Logs</h3>
              <p>
                Get real-time notifications whenever your records are accessed.
                View a complete audit trail of who accessed what and when.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Take Control of Your Medical Data?</h2>
        <p>
          Join thousands of users who've already secured their medical records
          with our blockchain platform.
        </p>
        <Link to="/signup" className="btn btn-primary btn-large">
          Get Started Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
