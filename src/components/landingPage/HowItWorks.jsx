import React, { useState } from "react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("process");

  return (
    <div className="how-it-works">
      {/* Header Banner */}
      <div className="header-banner">
        <h1>How MedSecure Works</h1>
        <p>
          Our blockchain solution puts you in control of your medical data with
          cutting-edge security and seamless access.
        </p>
        <button className="get-started-btn">Get Started Now</button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === "process" ? "active" : ""}`}
            onClick={() => setActiveTab("process")}
          >
            Process
          </button>
          <button
            className={`tab-button ${
              activeTab === "architecture" ? "active" : ""
            }`}
            onClick={() => setActiveTab("architecture")}
          >
            Architecture
          </button>
          <button
            className={`tab-button ${activeTab === "benefits" ? "active" : ""}`}
            onClick={() => setActiveTab("benefits")}
          >
            Benefits
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {activeTab === "process" && (
          <div className="process-content">
            <div className="section-header">
              <h2>The MedSecure Process</h2>
              <div className="underline"></div>
              <p>
                Our streamlined four-step process ensures your medical data
                remains secure and accessible only to those you authorize.
              </p>
            </div>

            {/* Step 1 */}
            <div className="step-card">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="step-content">
                <p className="step-number">Step 01</p>
                <h3>Secure Registration</h3>
                <p className="step-description">
                  Register with our platform to receive a unique blockchain
                  identity protected by multi-factor authentication.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <div className="step-content">
                <p className="step-number">Step 02</p>
                <h3>Upload Medical Records</h3>
                <p className="step-description">
                  Securely upload your medical documents which are encrypted and
                  stored on IPFS with only the hash saved on the blockchain.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <div className="step-content">
                <p className="step-number">Step 03</p>
                <h3>Manage Access Permissions</h3>
                <p className="step-description">
                  Grant access to specific healthcare providers through smart
                  contracts that enforce your access control policies.
                </p>
              </div>
            </div>

            {/* Step 4 - Not visible in the screenshot but included for completeness */}
            <div className="step-card">
              <div className="step-icon-container">
                <div className="step-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="step-content">
                <p className="step-number">Step 04</p>
                <h3>Track Access Activity</h3>
                <p className="step-description">
                  Monitor who accessed your records with detailed audit logs,
                  receiving notifications for all access attempts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="architecture-content">
            <div className="section-header">
              <h2>Technical Architecture</h2>
              <p>
                Our secure multi-layered approach to protecting your medical
                data
              </p>
            </div>
            <div className="placeholder-content">
              Architecture content will be displayed here.
            </div>
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="benefits-content">
            <div className="section-header">
              <h2>Key Benefits</h2>
              <p>
                Why our blockchain solution stands out from traditional medical
                record systems
              </p>
            </div>
            <div className="placeholder-content">
              Benefits content will be displayed here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HowItWorks;
