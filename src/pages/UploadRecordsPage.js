import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  X,
  Check,
  AlertCircle,
  Info,
  CloudUpload,
  Shield,
  Database,
} from "lucide-react";
import "./UploadRecordsPage.css";
import { saveRecord } from "../services/apiService";
import { useAuth } from "../contexts/AuthContext";
import { uploadToIPFS } from "../controllers/ipfsController"; // Add this line

const UploadRecordsPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [recordType, setRecordType] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [patientId, setPatientId] = useState(""); // Add for watermarking
  const [timestamp, setTimestamp] = useState(""); // Add for watermarking

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");

    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      // Check file type
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload PDF, JPG, PNG, DOC or DOCX");
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    if (!patientId || !timestamp) {
      setError("Patient ID and timestamp are required for watermarking");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      console.log("Starting upload process..."); // Debug log

      // Upload file to IPFS with metadata
      const uploadResult = await uploadToIPFS(file, {
        fileName,
        recordType,
        doctorName,
        description,
        patientId, // Include for watermarking
        timestamp, // Include for watermarking
      });
      const { ipfsHash, watermarkHash } = uploadResult; // Assume controller returns both

      // Create record data with watermarkHash
      const recordData = {
        fileName,
        recordType,
        doctorName: doctorName || "Unknown",
        description,
        fileSize: file.size,
        ipfsHash,
        watermarkHash, // Add for DB storage
        patientId: currentUser?._id || patientId, // Use input or user ID
        uploadDate: new Date().toISOString(),
      };

      // Save record to database
      await saveRecord(recordData);

      // Show progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const increment = Math.floor(Math.random() * 6) + 3;
          return prev + increment > 100 ? 100 : prev + increment;
        });
      }, 200);

      // Simulate completion
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setIsUploading(false);
        setUploadSuccess(true);

        // Navigate after success
        setTimeout(() => {
          navigate("/medical-records");
        }, 2000);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error); // Debug log
      setError(error.message || "Failed to upload record. Please try again.");
      setIsUploading(false);
    }
  };

  // Add file type icons based on extension
  const getFileIcon = () => {
    if (!file) return <FileText className="file-icon" />;

    const extension = fileName.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png"].includes(extension)) {
      return <div className="file-type-icon img-type">IMG</div>;
    } else if (extension === "pdf") {
      return <div className="file-type-icon pdf-type">PDF</div>;
    } else if (["doc", "docx"].includes(extension)) {
      return <div className="file-type-icon doc-type">DOC</div>;
    } else {
      return <FileText className="file-icon" />;
    }
  };

  // Calculate upload stage for progress messaging
  const getUploadStage = () => {
    if (uploadProgress < 35)
      return {
        text: "Encrypting file...",
        icon: <Shield className="stage-icon" />,
      };
    if (uploadProgress < 70)
      return {
        text: "Uploading to IPFS...",
        icon: <CloudUpload className="stage-icon" />,
      };
    return {
      text: "Recording on blockchain...",
      icon: <Database className="stage-icon" />,
    };
  };

  const uploadStage = getUploadStage();

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1 className="upload-title">
            <Upload className="header-icon" />
            Upload Medical Record
          </h1>
          <p className="upload-subtitle">
            <Info className="info-icon" />
            Files are encrypted and stored securely on IPFS
          </p>
        </div>

        <div className="upload-content">
          {uploadSuccess ? (
            <div className="success-message">
              <div className="success-icon-container">
                <Check className="success-icon" />
              </div>
              <div className="success-text">
                <h3 className="success-title">Upload Successful!</h3>
                <p className="success-description">
                  Your file has been encrypted and securely stored. The file
                  hash has been recorded on the blockchain for verification.
                </p>
                <p className="redirect-text">Redirecting to your records...</p>
              </div>
            </div>
          ) : error ? (
            <div className="error-message">
              <div className="error-icon-container">
                <AlertCircle className="error-icon" />
              </div>
              <div className="error-text">
                <p>{error}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="patientId">
                  Patient ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="patientId"
                  className="form-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="timestamp">
                  Timestamp <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="timestamp"
                  className="form-input"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="recordType">
                  Record Type <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    id="recordType"
                    className="form-select"
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    required
                  >
                    <option value="">Select Record Type</option>
                    <option value="prescription">Prescription</option>
                    <option value="labReport">Lab Report</option>
                    <option value="imaging">Imaging (X-Ray, MRI, etc.)</option>
                    <option value="discharge">Discharge Summary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doctorName">
                  Doctor Name
                </label>
                <input
                  type="text"
                  id="doctorName"
                  className="form-input"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Enter doctor's name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the medical record"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Upload File <span className="required">*</span>
                </label>

                {!file ? (
                  <div
                    className={`upload-dropzone ${
                      isDragging ? "dragging" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-upload").click()
                    }
                  >
                    <div className="upload-placeholder">
                      <CloudUpload
                        className={`upload-icon ${
                          isDragging ? "dragging-icon" : ""
                        }`}
                      />
                      <div className="upload-text">
                        <label htmlFor="file-upload" className="upload-link">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="hidden-input"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                        </label>
                        <p className="upload-or">or drag and drop</p>
                      </div>
                      <p className="upload-note">
                        PDF, JPG, PNG, DOC up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="file-preview">
                    <div className="file-info">
                      {getFileIcon()}
                      <div className="file-details">
                        <p className="file-name">{fileName}</p>
                        <p className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="remove-file-btn"
                      aria-label="Remove file"
                    >
                      <X className="remove-icon" />
                    </button>
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="upload-progress-container">
                  <div className="upload-stage">
                    {uploadStage.icon}
                    <label className="upload-stage-text">
                      {uploadStage.text}
                    </label>
                    <span className="upload-percentage">{uploadProgress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/medical-records")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`upload-btn ${isUploading ? "uploading" : ""}`}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle
                          className="path"
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="5"
                        ></circle>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="btn-icon" />
                      Upload Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-title">
          <Info className="info-icon" />
          How it works
        </h3>
        <ul className="info-list">
          <li className="info-item">
            <div className="info-item-dot"></div>
            <span>
              Your medical records are encrypted using AES-256 encryption
            </span>
          </li>
          <li className="info-item">
            <div className="info-item-dot"></div>
            <span>
              Files are stored on IPFS (InterPlanetary File System), a
              distributed storage network
            </span>
          </li>
          <li className="info-item">
            <div className="info-item-dot"></div>
            <span>
              A reference hash is recorded on the blockchain to ensure
              immutability
            </span>
          </li>
          <li className="info-item">
            <div className="info-item-dot"></div>
            <span>
              Only you control access to your medical records, with granular
              permission settings
            </span>
          </li>
        </ul>
        <div className="info-links">
          <button onClick={toggleModal} className="info-link">
            <svg className="link-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Learn More
          </button>
          <button onClick={toggleModal} className="info-link">
            <svg className="link-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
            Privacy Policy
          </button>
          <button onClick={toggleModal} className="info-link">
            <svg className="link-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Support
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">How MedSecure Works</h3>
              <button className="modal-close" onClick={toggleModal}>
                <X className="close-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h4 className="section-title">Secure Storage</h4>
                <p className="section-text">
                  MedSecure uses state-of-the-art encryption technology to
                  ensure your medical records remain private. Every file is
                  encrypted with AES-256 before being stored on the IPFS
                  network.
                </p>
              </div>
              <div className="modal-section">
                <h4 className="section-title">Blockchain Verification</h4>
                <p className="section-text">
                  A unique cryptographic hash of your encrypted document is
                  recorded on a blockchain, creating an immutable timestamp that
                  verifies the authenticity of your records.
                </p>
              </div>
              <div className="modal-section">
                <h4 className="section-title">Access Control</h4>
                <p className="section-text">
                  You maintain complete control over who can access your
                  records. Grant temporary or permanent access to healthcare
                  providers through our secure permission system.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn primary" onClick={toggleModal}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadRecordsPage;
