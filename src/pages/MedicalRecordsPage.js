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
  Plus,
  List,
  Grid,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import "./MedicalRecordsPage.css";

const MedicalRecordsPage = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin-dashboard");
    }
  }, [isAdmin, navigate]);

  const handleUploadClick = () => {
    navigate("/upload-records");
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  // Fetch records from the backend API
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        // Get user ID from current user
        const userId = currentUser?._id || currentUser?.id;

        if (!userId) {
          console.error("No user ID found!");
          setLoading(false);
          setRecords([]);
          return;
        }

        console.log("Fetching records for user ID:", userId);

        // Filter by current user ID
        const response = await fetch(`/api/records?userId=${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch records");
        }

        const data = await response.json();
        console.log("Fetched records:", data);
        setRecords(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching records:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Wait for auth to complete
    if (authLoading) {
      return;
    }

    // Check if user is logged in
    if (!currentUser) {
      setLoading(false);
      setRecords([]);
      setError("No user session. Please login.");
      return;
    }

    fetchRecords();
  }, [currentUser, authLoading]);

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || record.recordType === filterType;

    return matchesSearch && matchesType;
  });

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

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size to be more readable
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Open file in IPFS gateway with authenticity check
  const openInIPFS = async (ipfsUrl, ipfsHash) => {
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
        alert("Image has been tampered with and is not authentic!");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Unable to verify authenticity. Please try again.");
    }
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <main className="main-content">
        <div className="records-container">
          <div className="records-header">
            <div className="title-area">
              <FileText className="title-icon" />
              <h2>My Medical Records</h2>
              <span className="record-count">{records.length} Records</span>
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

          <div className="upload-button-container">
            <button className="upload-record-btn" onClick={handleUploadClick}>
              <Plus size={16} />
              Upload New Record
            </button>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading your medical records...</p>
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
                {searchTerm || filterType !== "all"
                  ? "No records match your search criteria."
                  : "You haven't uploaded any medical records yet."}
              </p>
              <button className="upload-record-btn" onClick={handleUploadClick}>
                <Plus size={16} />
                Upload Your First Record
              </button>
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
                  )}`}
                >
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
                        className="view-ipfs-button"
                        onClick={() =>
                          openInIPFS(record.ipfsUrl, record.ipfsHash)
                        }
                        title="View on IPFS"
                      >
                        <ExternalLink size={14} />
                        View File
                      </button>
                      <button
                        className="view-details-button"
                        onClick={() => {
                          // You can add a modal or navigate to a details page here
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <Shield size={20} />
              <span>MedSecure</span>
            </div>
            <p>
              Secure your medical records with blockchain technology. Take
              control of your health data with our decentralized platform.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <div className="quick-links">
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/features">Features</a>
              <a href="/contact">Contact</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
          </div>
        </div>

        <div className="copyright">
          © {new Date().getFullYear()} MedSecure. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MedicalRecordsPage;
