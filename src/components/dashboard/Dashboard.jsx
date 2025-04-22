import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeFeature, setActiveFeature] = useState("dashboard");

  const features = [
    {
      id: "records",
      title: "Medical Records",
      description: "View and manage your medical documents",
      path: "/medical-records",
      icon: "records-icon",
    },
    {
      id: "upload",
      title: "Upload Records",
      description: "Securely upload new medical files",
      path: "/upload-records",
      icon: "upload-icon",
    },
    {
      id: "access",
      title: "Access Management",
      description: "Control who can access your records",
      path: "/access-management",
      icon: "access-icon",
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "View alerts and access history",
      path: "/notifications",
      icon: "notification-icon",
    },
  ];

  const handleFeatureClick = (path, id) => {
    setActiveFeature(id);
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {currentUser?.displayName || "User"}</h1>
          <p>Manage your medical records securely</p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Your Medical Dashboard</h2>
          <p>Access and manage your medical information</p>
        </div>

        <div className="features-container">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`feature-card ${
                activeFeature === feature.id ? "active" : ""
              }`}
              onClick={() => handleFeatureClick(feature.path, feature.id)}
            >
              <div className={`feature-icon ${feature.icon}`} />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
