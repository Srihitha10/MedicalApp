import React from "react";
import "./Features.css";
import {
  FaLock,
  FaDatabase,
  FaFileContract,
  FaClipboardList,
} from "react-icons/fa";

const Features = () => {
  const features = [
    {
      icon: <FaLock className="feature-icon" />,
      title: "Secure Authentication",
      description:
        "Register with multi-factor authentication and receive your unique blockchain identity.",
    },
    {
      icon: <FaDatabase className="feature-icon" />,
      title: "Decentralized Storage",
      description:
        "Your records are encrypted and stored on IPFS with only the hash stored on blockchain.",
    },
    {
      icon: <FaFileContract className="feature-icon" />,
      title: "Smart Contract Access",
      description:
        "Grant or revoke access to your records for doctors and family members in real-time.",
    },
    {
      icon: <FaClipboardList className="feature-icon" />,
      title: "Complete Audit Trail",
      description:
        "Get notified of all access attempts with a transparent, immutable access log.",
    },
  ];

  return (
    <section id="features" className="features-section">
      <div className="container">
        <h2 className="section-title">How Our Platform Works</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-container">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
