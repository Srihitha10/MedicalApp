import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FileText,
  FileImage,
  Activity,
  Calendar,
  Search,
  Shield,
  List,
  Grid,
  ExternalLink,
  User,
  LogOut,
  Users,
  AlertTriangle,
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [users, setUsers] = useState([]);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  // Fetch all records and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all records
        const recordsResponse = await fetch("/api/records");
        if (!recordsResponse.ok) throw new Error("Failed to fetch records");
        const recordsData = await recordsResponse.json();
        setRecords(recordsData);

        // Extract unique users from records
        const uniqueUsers = [...new Set(recordsData.map((r) => r.patientId))];
        setUsers(uniqueUsers);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || record.recordType === filterType;

    const matchesUser =
      selectedUser === "all" || record.patientId === selectedUser;

    return matchesSearch && matchesType && matchesUser;
  });

  // CRITICAL: Admin tampering function
  const openInIPFSWithTamperOptions = async (ipfsUrl, ipfsHash, recordId) => {
    const tamperChoice = window.confirm(
      "🔐 ADMIN OPTIONS\n\n" +
        "Do you want to TAMPER with this image?\n\n" +
        "✅ Click OK to tamper (rotate/crop/modify)\n" +
        "❌ Click Cancel to view authentic image"
    );

    if (tamperChoice) {
      const tamperAction = window.prompt(
        "Choose tampering action:\n\n" +
          "1 - Rotate 90°\n" +
          "2 - Rotate 180°\n" +
          "3 - Adjust brightness (add noise)\n" +
          "4 - Crop image (10% edges)\n\n" +
          "Enter number (1-4):"
      );

      if (tamperAction >= 1 && tamperAction <= 4) {
        try {
          console.log(
            `Admin tampering: IPFS=${ipfsHash}, Type=${tamperAction}`
          );

          const response = await fetch("/api/ipfs/tamper", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ipfsHash,
              tamperType: parseInt(tamperAction),
              recordId,
            }),
          });

          const result = await response.json();

          if (result.success) {
            alert(
              `✅ Image tampered successfully!\n\n` +
                `Action: ${
                  ["", "Rotated 90°", "Rotated 180°", "Noise added", "Cropped"][
                    tamperAction
                  ]
                }\n` +
                `New IPFS Hash: ${result.newIpfsHash}\n\n` +
                `⚠️ Users will now see this as TAMPERED when they try to view it.`
            );

            // Refresh records without full page reload
            const recordsResponse = await fetch("/api/records");
            const recordsData = await recordsResponse.json();
            setRecords(recordsData);
          } else {
            alert("❌ Failed to tamper image: " + result.error);
          }
        } catch (error) {
          console.error("Tampering failed:", error);
          alert("❌ Unable to tamper image. Please try again.");
        }
      }
    } else {
      // View authentic image
      try {
        const response = await fetch("/api/ipfs/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ipfsHash }),
        });
        const result = await response.json();

        if (result.status === "AUTHENTIC") {
          window.open(ipfsUrl, "_blank");
        } else {
          const viewAnyway = window.confirm(
            "⚠️ This image has been marked as TAMPERED!\n\nDo you want to view it anyway?"
          );
          if (viewAnyway) {
            window.open(ipfsUrl, "_blank");
          }
        }
      } catch (error) {
        console.error("Verification failed:", error);
        window.open(ipfsUrl, "_blank");
      }
    }
  };

  // ...existing helper functions (getRecordTypeIcon, formatDate, etc.)...
  const getRecordTypeIcon = (type) => {
    switch (type) {
      case "prescription":
        return <FileText className="record-type-icon prescription-icon" />;
      case "labReport":
        return <Activity className="record-type-icon lab-icon" />;
      case "imaging":
        return <FileImage className="record-type-icon imaging-icon" />;
      default:
        return <FileText className="record-type-icon" />;
    }
  };

  const getRecordTypeName = (type) => {
    switch (type) {
      case "prescription":
        return "Prescription";
      case "labReport":
        return "Lab Report";
      case "imaging":
        return "Imaging";
      default:
        return "Other";
    }
  };

  const getRecordTypeClass = (type) => {
    switch (type) {
      case "prescription":
        return "prescription-bg";
      case "labReport":
        return "lab-bg";
      case "imaging":
        return "imaging-bg";
      default:
        return "";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <Shield size={24} />
          <h1>Admin Dashboard - All Medical Records</h1>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <main className="admin-content">
        <div className="records-container">
          <div className="records-header">
            <div className="title-area">
              <Users className="title-icon" />
              <h2>All Records ({records.length})</h2>
              <span className="user-count">{users.length} Users</span>
            </div>

            <div className="controls">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="prescription">Prescriptions</option>
                <option value="labReport">Lab Reports</option>
                <option value="imaging">Imaging</option>
              </select>

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    User: {user.substring(0, 20)}...
                  </option>
                ))}
              </select>

              <div className="view-toggle">
                <button
                  className={viewMode === "grid" ? "active" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={viewMode === "list" ? "active" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading all medical records...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="no-records-container">
              <FileText size={48} opacity={0.5} />
              <h3>No Records Found</h3>
              <p>
                {searchTerm || filterType !== "all" || selectedUser !== "all"
                  ? "No records match your search criteria."
                  : "No medical records in the system yet."}
              </p>
            </div>
          ) : (
            <div
              className={`records-grid ${
                viewMode === "list" ? "list-view" : ""
              }`}
            >
              {filteredRecords.map((record) => (
                <div
                  key={record._id}
                  className={`record-card ${getRecordTypeClass(
                    record.recordType
                  )} ${record.tampered ? "tampered-card" : ""}`}
                >
                  <div className="record-user-badge">
                    <User size={12} />
                    <span>{record.patientId.substring(0, 20)}...</span>
                  </div>

                  {record.tampered && (
                    <div className="tampered-badge">
                      <AlertTriangle size={14} />
                      <span>TAMPERED</span>
                    </div>
                  )}

                  <div className="record-type">
                    {getRecordTypeIcon(record.recordType)}
                    <span>{getRecordTypeName(record.recordType)}</span>
                  </div>
                  <h3 className="record-name">{record.fileName}</h3>

                  {record.description && (
                    <p className="record-description">{record.description}</p>
                  )}

                  <div className="record-metadata">
                    <div className="record-date">
                      <Calendar size={12} />
                      <span>
                        {formatDate(
                          record.date || record.uploadDate || record.createdAt
                        )}
                      </span>
                    </div>

                    {record.doctorName && (
                      <div className="record-doctor">
                        <User size={12} />
                        <span>Dr. {record.doctorName}</span>
                      </div>
                    )}
                  </div>

                  <div className="record-footer">
                    <span className="file-size">
                      {formatFileSize(record.fileSize)}
                    </span>
                    <div className="record-actions">
                      <button
                        className={`view-ipfs-button ${
                          record.tampered ? "tampered-btn" : ""
                        }`}
                        onClick={() =>
                          openInIPFSWithTamperOptions(
                            record.ipfsUrl,
                            record.ipfsHash,
                            record._id
                          )
                        }
                        title="View or Tamper Image (Admin Only)"
                      >
                        <ExternalLink size={14} />
                        {record.tampered ? "View/Re-Tamper" : "View/Tamper"}
                      </button>
                      <button
                        className="view-details-button"
                        onClick={() => {
                          alert(`IPFS Hash: ${record.ipfsHash}`);
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  <div className="record-hash">
                    <span className="hash-label">IPFS Hash:</span>
                    <span className="hash-value" title={record.ipfsHash}>
                      {record.ipfsHash.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
