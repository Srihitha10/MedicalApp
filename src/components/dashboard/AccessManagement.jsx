import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AccessManagement.css";

const AccessManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [accessList, setAccessList] = useState([]);
  const [newAccessForm, setNewAccessForm] = useState({
    recipientId: "",
    relationship: "family",
    expiresDays: 30,
    notes: "",
    allowPrescription: true,
    allowLabReport: true,
    allowImaging: true,
    allowOther: true,
  });

  const currentUserId = currentUser?._id || currentUser?.id;

  const fetchAccessGrants = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/access/grants?patientId=${encodeURIComponent(currentUserId)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load access grants");
      }

      const data = await response.json();
      setAccessList(data || []);
    } catch (error) {
      toast.error(error.message || "Unable to load grants");
      setAccessList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessGrants();
  }, [currentUserId]);

  const filteredAccessList = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return accessList.filter(
      (item) =>
        item.granteePatientId?.toLowerCase().includes(term) ||
        item.granteeDoctorPublicId?.toLowerCase().includes(term) ||
        item.granteeName?.toLowerCase().includes(term) ||
        item.relationship?.toLowerCase().includes(term),
    );
  }, [accessList, searchTerm]);

  const handleRevokeAccess = async (grantId) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/access/grants/${grantId}/revoke`, {
        method: "PUT",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to revoke access");
      }

      toast.success("Access revoked");
      await fetchAccessGrants();
    } catch (error) {
      toast.error(error.message || "Failed to revoke access");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTypes = () => {
    const types = [];
    if (newAccessForm.allowPrescription) types.push("prescription");
    if (newAccessForm.allowLabReport) types.push("labReport");
    if (newAccessForm.allowImaging) types.push("imaging");
    if (newAccessForm.allowOther) types.push("other");
    return types;
  };

  const handleSubmitNewAccess = async (event) => {
    event.preventDefault();

    if (!currentUserId) {
      toast.error("No active user session");
      return;
    }

    try {
      setIsProcessing(true);

      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + Number(newAccessForm.expiresDays),
      );

      const response = await fetch("/api/access/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: currentUserId,
          recipientId: newAccessForm.recipientId.trim().toUpperCase(),
          relationship: newAccessForm.relationship,
          expiresAt: expiresAt.toISOString(),
          allowedRecordTypes: selectedTypes(),
          notes: newAccessForm.notes,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to create access grant");
      }

      toast.success("Access granted successfully");
      setShowModal(false);
      setNewAccessForm({
        recipientId: "",
        relationship: "family",
        expiresDays: 30,
        notes: "",
        allowPrescription: true,
        allowLabReport: true,
        allowImaging: true,
        allowOther: true,
      });
      await fetchAccessGrants();
    } catch (error) {
      toast.error(error.message || "Failed to grant access");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="access-management">
        <div className="header-section">
          <div className="title-area">
            <Shield className="icon" />
            <h1>Access Management</h1>
          </div>
        </div>
        <p>Loading access list...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="access-management"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="header-section">
        <div className="title-area">
          <Shield className="icon" />
          <div>
            <h1>Access Management</h1>
            <p style={{ margin: 0 }}>Your Patient ID: {currentUserId}</p>
          </div>
        </div>

        <div className="controls-area">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by patient ID, name or relationship..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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

      <div className="active-access">
        <h2>Configured Permissions</h2>
        <div className="access-grid">
          {filteredAccessList.length === 0 ? (
            <p>
              No grants found. Create one to share records with trusted members.
            </p>
          ) : (
            filteredAccessList.map((access) => (
              <motion.div
                key={access._id}
                className={`access-card ${access.status}`}
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="access-header">
                  <div className="user-info">
                    <div className="avatar">
                      {access.granteeName?.charAt(0) || "U"}
                    </div>
                    <div className="details">
                      <h3>{access.granteeName}</h3>
                      <p>Patient ID: {access.granteePatientId}</p>
                      {access.granteeDoctorPublicId && (
                        <p>Doctor ID: {access.granteeDoctorPublicId}</p>
                      )}
                    </div>
                  </div>
                  <span className={`status-badge ${access.status}`}>
                    {access.status}
                  </span>
                </div>

                <div className="access-details">
                  <div className="detail-item">
                    <span className="label">Relationship</span>
                    <span className="value">{access.relationship}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Allowed Types</span>
                    <span className="value">
                      {access.allowedRecordTypes?.length
                        ? access.allowedRecordTypes.join(", ")
                        : "All"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Expires</span>
                    <span className="value">
                      {access.expiresAt
                        ? new Date(access.expiresAt).toLocaleDateString()
                        : "No expiry"}
                    </span>
                  </div>
                </div>

                {access.status === "active" && (
                  <button
                    className="revoke-btn"
                    disabled={isProcessing}
                    onClick={() => handleRevokeAccess(access._id)}
                  >
                    Revoke Access
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Grant New Access</h2>
            <form onSubmit={handleSubmitNewAccess}>
              <div className="form-group">
                <label>
                  Recipient{" "}
                  {newAccessForm.relationship === "doctor"
                    ? "Doctor ID"
                    : "Patient ID"}
                </label>
                <input
                  type="text"
                  inputMode="text"
                  placeholder={
                    newAccessForm.relationship === "doctor"
                      ? "e.g. D1000 or doctor patient ID"
                      : "e.g. 1002"
                  }
                  title={
                    newAccessForm.relationship === "doctor"
                      ? "Enter doctor ID (D1000+) or doctor patient ID"
                      : "Enter numeric patient ID (1000 or above)"
                  }
                  required
                  value={newAccessForm.recipientId}
                  onChange={(event) =>
                    setNewAccessForm((prev) => ({
                      ...prev,
                      recipientId: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>
                <select
                  value={newAccessForm.relationship}
                  onChange={(event) =>
                    setNewAccessForm((prev) => ({
                      ...prev,
                      relationship: event.target.value,
                    }))
                  }
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="doctor">Doctor</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="specialist">Specialist</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expires In (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={newAccessForm.expiresDays}
                  onChange={(event) =>
                    setNewAccessForm((prev) => ({
                      ...prev,
                      expiresDays: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Record Types Allowed</label>
                <div style={{ display: "grid", gap: 8 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAccessForm.allowPrescription}
                      onChange={(event) =>
                        setNewAccessForm((prev) => ({
                          ...prev,
                          allowPrescription: event.target.checked,
                        }))
                      }
                    />
                    Prescription
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAccessForm.allowLabReport}
                      onChange={(event) =>
                        setNewAccessForm((prev) => ({
                          ...prev,
                          allowLabReport: event.target.checked,
                        }))
                      }
                    />
                    Lab Report
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAccessForm.allowImaging}
                      onChange={(event) =>
                        setNewAccessForm((prev) => ({
                          ...prev,
                          allowImaging: event.target.checked,
                        }))
                      }
                    />
                    Imaging
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAccessForm.allowOther}
                      onChange={(event) =>
                        setNewAccessForm((prev) => ({
                          ...prev,
                          allowOther: event.target.checked,
                        }))
                      }
                    />
                    Other
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  value={newAccessForm.notes}
                  onChange={(event) =>
                    setNewAccessForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isProcessing}
                >
                  Grant Access
                </button>
              </div>
            </form>

            <button
              className="submit-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AccessManagement;
