import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToIPFS } from "../../services/ipfsService"; // Add this import
import "./RecordUpload.css";

const RecordUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [recordType, setRecordType] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [uploadingStatus, setUploadingStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const goBack = () => {
    navigate("/dashboard");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadingStatus("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setUploadingStatus("Encrypting file...");
    setUploadProgress(20);

    try {
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      setUploadingStatus("File uploaded to IPFS!");
      setUploadProgress(100);

      // Store the record metadata
      const recordData = {
        hash: ipfsHash,
        type: recordType,
        doctorName: doctorName,
        date: date,
        fileName: fileName,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage (temporary solution)
      const records = JSON.parse(
        localStorage.getItem("medicalRecords") || "[]"
      );
      records.push(recordData);
      localStorage.setItem("medicalRecords", JSON.stringify(records));

      // Reset form after successful upload
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setFileName("");
        setRecordType("");
        setDoctorName("");
        setDate("");
        setUploadingStatus("Your medical record has been securely uploaded");
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadingStatus("Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-records-container">
      <header className="dashboard-header">
        <div className="logo">
          {/* Logo can just be an icon or image if needed */}
        </div>
        <nav className="dashboard-nav">
          <button className="nav-item" onClick={goBack}>
            Dashboard
          </button>
          <button className="nav-item active">Upload Records</button>
          <button className="nav-item">My Records</button>
          <button className="nav-item">Access</button>
        </nav>
        <div className="user-menu">
          <button className="user-profile">
            <div className="avatar">PT</div>
            <span>Patient</span>
          </button>
          <div className="notification-icon">
            <span className="notification-badge">3</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
        </div>
      </header>

      <main className="upload-main">
        <div className="upload-container">
          <div className="upload-header">
            <h2>Upload Medical Record</h2>
            <p>
              Securely upload and encrypt your medical files for storage on the
              blockchain
            </p>
          </div>

          <div className="upload-content">
            <div className="upload-info">
              <div className="info-card">
                <div className="info-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div className="info-content">
                  <h3>How It Works</h3>
                  <ol>
                    <li>Your file is encrypted locally</li>
                    <li>Encrypted file is stored on IPFS</li>
                    <li>Only the file hash is stored on the blockchain</li>
                    <li>You control who can access your records</li>
                  </ol>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="info-content">
                  <h3>Security Benefits</h3>
                  <ul>
                    <li>End-to-end encryption</li>
                    <li>Immutable blockchain record</li>
                    <li>Decentralized storage</li>
                    <li>Access control with smart contracts</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <div
                className={`file-drop-area ${file ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p>Drag and drop file here or</p>
                    <label className="file-select-button">
                      Browse Files
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="file-types">
                      Supported files: PDF, Images, Word documents
                    </p>
                  </>
                ) : (
                  <div className="selected-file">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <div className="file-info">
                      <p className="file-name">{fileName}</p>
                      <p className="file-size">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => {
                        setFile(null);
                        setFileName("");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-fields">
                <div className="form-group">
                  <label htmlFor="recordType">Record Type</label>
                  <select
                    id="recordType"
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    required
                  >
                    <option value="">Select Record Type</option>
                    <option value="lab-result">Lab Results</option>
                    <option value="prescription">Prescription</option>
                    <option value="imaging">Imaging (X-ray, MRI, etc.)</option>
                    <option value="clinical-notes">Clinical Notes</option>
                    <option value="discharge-summary">Discharge Summary</option>
                    <option value="vaccination">Vaccination Record</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="doctorName">Doctor/Institution Name</label>
                  <input
                    type="text"
                    id="doctorName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recordDate">Record Date</label>
                  <input
                    type="date"
                    id="recordDate"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-status">
                    <span>{uploadingStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadingStatus && !isUploading && (
                <div className="upload-status">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p>{uploadingStatus}</p>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={goBack}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="upload-button"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Encrypt & Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>&copy; 2025 MedSecure. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RecordUpload;
