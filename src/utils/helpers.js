/**
 * Utility helper functions for the medical blockchain application
 */

// Format date to readable string (e.g., "April 12, 2025")
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format date with time (e.g., "April 12, 2025, 2:30 PM")
export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate time elapsed (e.g., "2 days ago")
export const timeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;

  return "just now";
};

// Truncate blockchain addresses or hashes
export const truncateHash = (hash, startLength = 6, endLength = 4) => {
  if (!hash) return "";

  if (hash.length <= startLength + endLength) return hash;

  return `${hash.substring(0, startLength)}...${hash.substring(
    hash.length - endLength
  )}`;
};

// Format file size (convert bytes to KB, MB, etc.)
export const formatFileSize = (size) => {
  if (!size) return "0 Bytes";

  // If size is already formatted (e.g., '5MB'), return as is
  if (typeof size === "string" && /^[\d.]+\s?[KMGTPEZY]?B$/i.test(size)) {
    return size;
  }

  const bytes = Number(size);
  const units = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${parseFloat(value)} ${units[i]}`;
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return "";

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Generate random ID for temporary use in the application
export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get file extension from filename
export const getFileExtension = (filename) => {
  if (!filename) return "";

  return filename.split(".").pop().toLowerCase();
};

// Determine icon based on file type
export const getFileIcon = (fileType) => {
  if (!fileType) return "document";

  const type = fileType.toLowerCase();

  if (["pdf", "doc", "docx", "txt"].includes(type)) return "file-text";
  if (["jpg", "jpeg", "png", "gif", "bmp"].includes(type)) return "image";
  if (["mp4", "avi", "mov", "wmv"].includes(type)) return "video";
  if (["mp3", "wav", "ogg"].includes(type)) return "music";
  if (["zip", "rar", "7z"].includes(type)) return "archive";
  if (["xls", "xlsx", "csv"].includes(type)) return "spreadsheet";
  if (["dicom"].includes(type)) return "activity";

  return "file";
};

// Format blockchain transaction ID for display
export const formatTransactionId = (transactionId) => {
  return truncateHash(transactionId, 10, 8);
};

// Check if a date is expired
export const isExpired = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  return date < new Date();
};

// Check if a date is approaching expiration (within 7 days)
export const isApproachingExpiration = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  return date > today && date <= sevenDaysFromNow;
};

// Debounce function to limit the rate at which a function can fire
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    const context = this;

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// Throttle function to limit the rate at which a function can fire
export const throttle = (func, limit) => {
  let inThrottle;

  return function (...args) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Download a file (for IPFS file retrieval)
export const downloadFile = (fileUrl, fileName) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Validate email format
export const isValidEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Parse JWT token
export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded) return true;

  return decoded.exp * 1000 < Date.now();
};

// Get user role from token
export const getUserRoleFromToken = (token) => {
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded) return null;

  return decoded.role;
};
