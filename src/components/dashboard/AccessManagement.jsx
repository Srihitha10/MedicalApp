import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Users, Check, X, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useBlockchain } from "../../contexts/BlockchainContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AccessManagement.css";

const Loader = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{ height: "100vh" }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);
const AccessManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { revokeAccess, grantAccess } = useBlockchain();
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAccessForm, setNewAccessForm] = useState({
    name: "",
    email: "",
    role: "doctor",
    institution: "",
    accessLevel: "read",
  });

  // Filter function for search
  const filteredAccessList = accessList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Revoke Access
  const handleRevokeAccess = async (id) => {
    setIsProcessing(true);
    try {
      await revokeAccess(id);
      setAccessList(
        accessList.map((item) =>
          item.id === id ? { ...item, status: "revoked" } : item
        )
      );
      toast.success("Access revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke access");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Grant Access
  const handleGrantAccess = async (request) => {
    setIsProcessing(true);
    try {
      await grantAccess(request.id);

      // Remove from pending requests
      setPendingRequests((prev) => prev.filter((req) => req.id !== request.id));

      // Add to access list
      const newAccess = {
        id: request.id,
        name: request.name,
        role: request.role,
        institution: request.institution,
        status: "active",
        granted: new Date().toISOString().split("T")[0],
        accessLevel: "full",
      };

      setAccessList((prev) => [...prev, newAccess]);
      toast.success("Access granted successfully");
    } catch (error) {
      toast.error("Failed to grant access");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Deny Access
  const handleDenyAccess = async (id) => {
    setPendingRequests((prev) => prev.filter((req) => req.id !== id));
    toast.info("Access request denied");
  };

  // Mock data - in a real app, you'd fetch this from your blockchain service
  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setAccessList([
        {
          id: "1",
          name: "Dr. James Wilson",
          role: "doctor",
          institution: "City Hospital",
          email: "jwilson@hospital.com",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          granted: "2024-03-15",
          expires: "2024-09-15",
          accessLevel: "full",
          lastAccessed: "2024-04-05",
          accessCount: 8,
          status: "active",
        },
        {
          id: "2",
          name: "Dr. Sarah Chen",
          role: "specialist",
          institution: "Medical Center",
          email: "schen@medcenter.com",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
          granted: "2024-02-20",
          expires: "2024-05-20",
          accessLevel: "partial",
          lastAccessed: "2024-04-02",
          accessCount: 3,
          status: "active",
        },
        {
          id: "3",
          name: "Metro Labs",
          role: "laboratory",
          institution: "Metro Labs Inc.",
          email: "records@metrolabs.com",
          avatar: null,
          granted: "2024-01-10",
          expires: "2024-07-10",
          accessLevel: "limited",
          lastAccessed: "2024-03-28",
          accessCount: 2,
          status: "active",
        },
        {
          id: "4",
          name: "Dr. Michael Brown",
          role: "doctor",
          institution: "Family Practice",
          email: "mbrown@fampractice.com",
          avatar: "https://randomuser.me/api/portraits/men/91.jpg",
          granted: "2023-11-05",
          expires: "2024-05-05",
          accessLevel: "full",
          lastAccessed: "2024-02-15",
          accessCount: 6,
          status: "revoked",
        },
      ]);

      setPendingRequests([
        {
          id: "req1",
          name: "Dr. Emily Johnson",
          role: "specialist",
          institution: "Heart Center",
          email: "ejohnson@heartcenter.com",
          avatar: "https://randomuser.me/api/portraits/women/63.jpg",
          requestDate: "2024-04-09",
          requested: "full",
        },
        {
          id: "req2",
          name: "Central Pharmacy",
          role: "pharmacy",
          institution: "Central Pharmacy Inc.",
          email: "records@centralpharm.com",
          avatar: null,
          requestDate: "2024-04-08",
          requested: "limited",
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // Handle form submission for new access
  const handleSubmitNewAccess = (e) => {
    e.preventDefault();

    const newAccess = {
      id: `access-${Date.now()}`,
      ...newAccessForm,
      status: "active",
      granted: new Date().toISOString().split("T")[0],
      expires: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      lastAccessed: null,
      accessCount: 0,
    };

    setAccessList((prev) => [...prev, newAccess]);
    setShowModal(false);
    setNewAccessForm({
      name: "",
      email: "",
      role: "doctor",
      institution: "",
      accessLevel: "read",
    });
    toast.success("Access granted successfully");
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  if (loading) return <Loader />;

  return (
    <motion.div
      className="access-management"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="header-section">
        <motion.div
          className="title-area"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <Shield className="icon" />
          <h1>Access Management</h1>
        </motion.div>

        <div className="controls-area">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, role or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="add-access-btn"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Grant New Access
          </motion.button>
        </div>
      </div>

      <div className="content-section">
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pending-requests"
            >
              <h2>Pending Requests ({pendingRequests.length})</h2>
              <div className="requests-grid">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    className="request-card"
                    layout
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    <div className="request-info">
                      <Users className="request-icon" />
                      <div className="request-details">
                        <h3>{request.name}</h3>
                        <p>{request.institution}</p>
                        <span className="request-type">{request.role}</span>
                      </div>
                    </div>
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleGrantAccess(request.id)}
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        className="deny-btn"
                        onClick={() => handleDenyAccess(request.id)}
                      >
                        <X size={16} />
                        Deny
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="active-access">
          <h2>Active Access Permissions</h2>
          <div className="access-grid">
            {filteredAccessList.map((access) => (
              <motion.div
                key={access.id}
                className={`access-card ${access.status}`}
                layout
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="access-header">
                  <div className="user-info">
                    <div className="avatar">{access.name.charAt(0)}</div>
                    <div className="details">
                      <h3>{access.name}</h3>
                      <p>{access.institution}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${access.status}`}>
                    {access.status}
                  </span>
                </div>

                <div className="access-details">
                  <div className="detail-item">
                    <span className="label">Access Level</span>
                    <span className="value">{access.accessLevel}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Access</span>
                    <span className="value">
                      {access.lastAccessed || "Never"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Expires</span>
                    <span className="value">{access.expires}</span>
                  </div>
                </div>

                {access.status === "active" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="revoke-btn"
                    onClick={() => handleRevokeAccess(access.id)}
                  >
                    Revoke Access
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Access Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <h2>Grant New Access</h2>
              <form onSubmit={handleSubmitNewAccess}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    required
                    value={newAccessForm.name}
                    onChange={(e) =>
                      setNewAccessForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={newAccessForm.email}
                    onChange={(e) =>
                      setNewAccessForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newAccessForm.role}
                    onChange={(e) =>
                      setNewAccessForm((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                  >
                    <option value="doctor">Doctor</option>
                    <option value="specialist">Specialist</option>
                    <option value="family">Family Member</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Institution</label>
                  <input
                    type="text"
                    required
                    value={newAccessForm.institution}
                    onChange={(e) =>
                      setNewAccessForm((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Grant Access
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccessManagement;
