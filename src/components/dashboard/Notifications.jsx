import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  Check,
} from "lucide-react";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: "access",
          title: "Medical Record Accessed",
          message: "Dr. James Wilson accessed your medical records",
          record: "X-Ray Report",
          timestamp: "368 days ago",
          doctor: "Dr. James Wilson (doctor)",
          status: "read",
          priority: "normal",
        },
        {
          id: 2,
          type: "request",
          title: "New Access Request",
          message:
            "Dr. Emily Johnson has requested access to your medical records",
          timestamp: "370 days ago",
          status: "unread",
          priority: "high",
          action: "View Request",
        },
        // ... add more notifications
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "access":
        return <Shield className="notification-icon access" />;
      case "request":
        return <Bell className="notification-icon request" />;
      case "system":
        return <AlertTriangle className="notification-icon system" />;
      default:
        return <FileText className="notification-icon" />;
    }
  };

  const handleViewRequest = (requestId) => {
    navigate("/access-management", {
      state: {
        showPendingRequest: true,
        requestId: requestId,
      },
    });
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  return (
    <motion.div
      className="notifications-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="notifications-header">
        <div className="header-content">
          <h1>Notifications</h1>
          <div className="notification-filters">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`tab ${activeTab === "unread" ? "active" : ""}`}
                onClick={() => setActiveTab("unread")}
              >
                Unread
                <span className="badge">2</span>
              </button>
              <button
                className={`tab ${activeTab === "access" ? "active" : ""}`}
                onClick={() => setActiveTab("access")}
              >
                Access
              </button>
              <button
                className={`tab ${activeTab === "system" ? "active" : ""}`}
                onClick={() => setActiveTab("system")}
              >
                System
              </button>
            </div>
            <button className="mark-all-read">
              <Check size={16} />
              Mark all as read
            </button>
          </div>
        </div>
      </header>

      <div className="notifications-content">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              className={`notification-card ${notification.status} ${notification.priority}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="notification-icon-wrapper">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-details">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                {notification.record && (
                  <div className="record-info">
                    <FileText size={14} />
                    <span>{notification.record}</span>
                  </div>
                )}
                <div className="notification-meta">
                  <span className="timestamp">
                    <Clock size={14} />
                    {notification.timestamp}
                  </span>
                  {notification.action === "View Request" && (
                    <button
                      className="action-button"
                      onClick={() => handleViewRequest(notification.id)}
                    >
                      {notification.action}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Notifications;
