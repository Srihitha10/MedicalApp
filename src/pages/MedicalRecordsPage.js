import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import "./MedicalRecordsPage.css";

const MedicalRecordsPage = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/upload-records");
  };

  const handleHomeClick = () => {
    navigate("/dashboard");
  };

  // Mock data
  const [records] = useState([
    {
      id: "1",
      fileName: "X-Ray Report.pdf",
      recordType: "imaging",
      uploadDate: "2025-04-10",
      fileSize: "2.4 MB",
    },
    {
      id: "2",
      fileName: "Blood Test Results.pdf",
      recordType: "labReport",
      uploadDate: "2025-04-13",
      fileSize: "1.2 MB",
    },
    {
      id: "3",
      fileName: "Prescription.jpg",
      recordType: "prescription",
      uploadDate: "2025-04-05",
      fileSize: "845 KB",
    },
  ]);

  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.fileName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
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

          <div
            className={`records-grid ${viewMode === "list" ? "list-view" : ""}`}
          >
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className={`record-card ${getRecordTypeClass(
                  record.recordType
                )}`}
              >
                <div className="record-type">
                  {getRecordTypeIcon(record.recordType)}
                  <span>{getRecordTypeName(record.recordType)}</span>
                </div>
                <h3 className="record-name">{record.fileName}</h3>
                <div className="record-date">
                  <Calendar size={12} />
                  <span>
                    Apr {record.uploadDate.split("-")[2]},{" "}
                    {record.uploadDate.split("-")[0]}
                  </span>
                </div>
                <div className="record-footer">
                  <span className="file-size">{record.fileSize}</span>
                  <button className="view-details-button">View Details</button>
                </div>
              </div>
            ))}
          </div>
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
