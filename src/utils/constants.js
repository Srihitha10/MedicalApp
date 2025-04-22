/**
 * Application constants used throughout the medical blockchain app
 */

// API Endpoints
export const API = {
  BASE_URL:
    process.env.REACT_APP_API_URL || "https://api.medblockchain.example.com/v1",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    VERIFY_TOKEN: "/auth/verify",
    RESET_PASSWORD: "/auth/password-reset-request",
  },
  USERS: {
    CURRENT: "/users/me",
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/change-password",
    ACTIVITY_LOG: "/users/activity",
  },
  NOTIFICATIONS: {
    GET_ALL: "/notifications",
    MARK_READ: "/notifications/:id/read",
    MARK_ALL_READ: "/notifications/read-all",
  },
  RECORDS: {
    GET_ALL: "/records",
    UPLOAD: "/records",
    GET_BY_ID: "/records/:id",
    DELETE: "/records/:id",
  },
  ACCESS: {
    GET_LIST: "/access",
    GRANT: "/access",
    REVOKE: "/access/:id",
    UPDATE: "/access/:id",
    REQUESTS: "/access/requests",
  },
  BLOCKCHAIN: {
    TRANSACTION_HISTORY: "/blockchain/history/:id",
    VERIFY_INTEGRITY: "/blockchain/verify",
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user_data",
  THEME: "app_theme",
  LAST_LOGIN: "last_login",
};

// User Roles
export const USER_ROLES = {
  PATIENT: "patient",
  PROVIDER: "healthcare_provider",
  ADMIN: "admin",
};

// Medical Record Categories
export const RECORD_CATEGORIES = [
  "Lab Results",
  "Imaging",
  "Prescription",
  "Diagnosis",
  "Vaccination",
  "Surgical Reports",
  "Medical History",
  "Discharge Summary",
  "Emergency Records",
  "Other",
];

// File Types
// File Types
export const FILE_TYPES = {
  PDF: "pdf",
  IMAGE: ["jpg", "jpeg", "png"],
  DICOM: "dicom",
  TEXT: "txt",
  DOCUMENT: ["doc", "docx"],
  SPREADSHEET: ["xls", "xlsx", "csv"],
  AUDIO: ["mp3", "wav"],
  VIDEO: ["mp4", "avi", "mov"],
  ARCHIVE: ["zip", "rar"],
};

// Access Levels
export const ACCESS_LEVELS = {
  FULL: "full",
  LIMITED: "limited",
  EMERGENCY: "emergency",
};

// Access Durations
export const ACCESS_DURATIONS = [
  { label: "24 hours", value: "24h" },
  { label: "1 week", value: "1w" },
  { label: "1 month", value: "1m" },
  { label: "3 months", value: "3m" },
  { label: "6 months", value: "6m" },
  { label: "1 year", value: "1y" },
];

// Blockchain Transaction Types
export const TRANSACTION_TYPES = {
  UPLOAD: "UPLOAD",
  ACCESS_GRANTED: "ACCESS_GRANTED",
  ACCESS_REVOKED: "ACCESS_REVOKED",
  RECORD_ACCESSED: "RECORD_ACCESSED",
  RECORD_UPDATED: "RECORD_UPDATED",
  RECORD_DELETED: "RECORD_DELETED",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  ACCESS_REQUEST: "access_request",
  RECORD_ACCESSED: "record_accessed",
  SYSTEM_UPDATE: "system_update",
  ACCESS_EXPIRING: "access_expiring",
  NEW_MESSAGE: "new_message",
};

// UI Theme Colors
export const THEME_COLORS = {
  PRIMARY: "#3c66c4",
  SECONDARY: "#38bdf8",
  SUCCESS: "#0ea5e9",
  DANGER: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#6366f1",
  LIGHT: "#f8fafc",
  DARK: "#1e293b",
};

// Default Pagination Settings
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50],
};

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Modal Sizes
export const MODAL_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
  FULL: "full",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SERVER_ERROR: "Server error. Please try again later.",
  IPFS_UPLOAD_ERROR: "Failed to upload file to IPFS storage.",
  BLOCKCHAIN_ERROR: "Blockchain transaction failed. Please try again.",
  FORM_VALIDATION: "Please check the form for errors and try again.",
  RECORD_NOT_FOUND: "Medical record not found.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful. Welcome back!",
  LOGOUT: "You have been successfully logged out.",
  REGISTRATION: "Registration successful. Welcome to MedBlockchain!",
  PROFILE_UPDATE: "Your profile has been updated successfully.",
  PASSWORD_CHANGE: "Your password has been changed successfully.",
  RECORD_UPLOAD: "Medical record uploaded successfully.",
  RECORD_DELETE: "Medical record removed successfully.",
  ACCESS_GRANT: "Access granted successfully.",
  ACCESS_REVOKE: "Access revoked successfully.",
  SETTINGS_UPDATE: "Settings updated successfully.",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  MEDICAL_RECORDS: "/records",
  RECORD_DETAIL: "/records/:id",
  ACCESS_MANAGEMENT: "/access",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  NOT_FOUND: "/404",
};

// Regular Expressions
export const REGEX = {
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  BLOCKCHAIN_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  IPFS_HASH: /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/,
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_WEAK:
    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
  PASSWORD_MISMATCH: "Passwords do not match",
  INVALID_BLOCKCHAIN_ADDRESS: "Invalid blockchain address format",
  INVALID_IPFS_HASH: "Invalid IPFS hash format",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (50MB)",
  UNSUPPORTED_FILE_TYPE: "File type not supported",
};

// Maximum File Size in Bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Default Avatar
export const DEFAULT_AVATAR = "/assets/images/default-avatar.png";

// Default Logo
export const LOGO = "/assets/images/logo.svg";

// Smart Contract ABIs
export const CONTRACT_ABI = {
  MEDICAL_RECORDS: [
    // ABI for MedicalRecords smart contract would go here
    // This is just a placeholder and should be replaced with the actual ABI
  ],
  ACCESS_CONTROL: [
    // ABI for AccessControl smart contract would go here
    // This is just a placeholder and should be replaced with the actual ABI
  ],
};

// Demo/Development Environment Flag
export const IS_DEMO = process.env.REACT_APP_DEMO_MODE === "true";

// Export all constants as a single object
export default {
  API,
  STORAGE_KEYS,
  USER_ROLES,
  RECORD_CATEGORIES,
  FILE_TYPES,
  ACCESS_LEVELS,
  ACCESS_DURATIONS,
  TRANSACTION_TYPES,
  NOTIFICATION_TYPES,
  THEME_COLORS,
  PAGINATION,
  ANIMATION,
  MODAL_SIZES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  REGEX,
  VALIDATION_MESSAGES,
  MAX_FILE_SIZE,
  DEFAULT_AVATAR,
  LOGO,
  CONTRACT_ABI,
  IS_DEMO,
};
