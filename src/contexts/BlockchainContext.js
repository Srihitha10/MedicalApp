import React, { createContext, useState, useContext } from "react";
import { ethers } from "ethers";
import { create } from "ipfs-http-client";
import { Buffer } from "buffer";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

// Mock smart contract ABI (in a real app, this would be imported from your compiled contract)
const mockContractABI = [
  "function grantAccess(address patient, address doctor, string recordHash)",
  "function revokeAccess(address patient, address doctor, string recordHash)",
  "function hasAccess(address patient, address doctor, string recordHash) view returns (bool)",
  "function uploadRecord(string recordHash, string metadata)",
  "function getRecords(address patient) view returns (string[])",
  "event AccessGranted(address indexed patient, address indexed doctor, string recordHash)",
  "event AccessRevoked(address indexed patient, address indexed doctor, string recordHash)",
  "event RecordUploaded(address indexed patient, string recordHash)",
];

// Create IPFS client (using public gateway for demo)
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const BlockchainContext = createContext();

export const useBlockchain = () => {
  return useContext(BlockchainContext);
};

export const BlockchainProvider = ({ children }) => {
  const { currentUser, walletAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [accessLog, setAccessLog] = useState([]);

  // Mock contract address (in a real app, this would be your deployed contract address)
  const contractAddress = "0x123456789abcdef123456789abcdef123456789a";

  // Function to encrypt file before uploading
  const encryptFile = async (file) => {
    // In a real app, implement proper encryption
    // This is just a placeholder to simulate encryption
    console.log("Encrypting file:", file.name);
    return file; // Return original file for now
  };

  // Upload file to IPFS
  const uploadToIPFS = async (file) => {
    try {
      setLoading(true);

      // Encrypt file first
      const encryptedFile = await encryptFile(file);

      // Convert file to buffer for IPFS
      const fileBuffer = await encryptedFile.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Upload to IPFS
      const result = await ipfs.add(buffer);
      const ipfsHash = result.path;

      // Store file reference on blockchain
      await storeFileHashOnBlockchain(ipfsHash, file.name);

      setLoading(false);
      return ipfsHash;
    } catch (error) {
      setLoading(false);
      console.error("Error uploading to IPFS:", error);
      toast.error("Failed to upload file to decentralized storage");
      throw error;
    }
  };

  // Store file hash on blockchain
  const storeFileHashOnBlockchain = async (ipfsHash, fileName) => {
    try {
      // In a real app, this would interact with your deployed smart contract
      console.log(
        `Storing hash ${ipfsHash} for file ${fileName} on blockchain`
      );

      // Mock successful blockchain transaction
      const newRecord = {
        id: Date.now().toString(),
        name: fileName,
        ipfsHash: ipfsHash,
        uploadDate: new Date().toISOString(),
        sharedWith: [],
      };

      // Update local state (in a real app, you'd get this from blockchain events)
      setRecords((prev) => [...prev, newRecord]);

      // Add to local storage for persistence in demo
      const storedRecords = JSON.parse(
        localStorage.getItem("medicalRecords") || "[]"
      );
      localStorage.setItem(
        "medicalRecords",
        JSON.stringify([...storedRecords, newRecord])
      );

      toast.success("Medical record stored securely on blockchain");
      return newRecord;
    } catch (error) {
      console.error("Error storing on blockchain:", error);
      toast.error("Failed to secure record on blockchain");
      throw error;
    }
  };

  // Fetch user's medical records
  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);

      // In a real app, fetch from blockchain
      // For demo, we'll use localStorage
      const storedRecords = JSON.parse(
        localStorage.getItem("medicalRecords") || "[]"
      );

      // Wait a bit to simulate blockchain query
      await new Promise((resolve) => setTimeout(resolve, 800));

      setRecords(storedRecords);
      return storedRecords;
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to retrieve your medical records");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Grant access to a doctor or family member
  const grantAccess = async (
    recordId,
    recipientAddress,
    recipientName,
    role
  ) => {
    try {
      setLoading(true);

      // Find the record
      const storedRecords = JSON.parse(
        localStorage.getItem("medicalRecords") || "[]"
      );
      const recordIndex = storedRecords.findIndex((r) => r.id === recordId);

      if (recordIndex === -1) {
        throw new Error("Record not found");
      }

      // Update record's sharedWith array
      const updatedRecords = [...storedRecords];
      const record = updatedRecords[recordIndex];

      // Check if already shared
      if (record.sharedWith.some((sw) => sw.address === recipientAddress)) {
        toast.info("Already shared with this recipient");
        setLoading(false);
        return;
      }

      // Add to sharedWith
      record.sharedWith.push({
        address: recipientAddress,
        name: recipientName,
        role: role,
        grantedAt: new Date().toISOString(),
      });

      // Update localStorage
      localStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));

      // Update access logs
      const newLog = {
        id: Date.now().toString(),
        action: "ACCESS_GRANTED",
        recordId: recordId,
        recordName: record.name,
        recipientAddress,
        recipientName,
        timestamp: new Date().toISOString(),
      };

      const storedLogs = JSON.parse(localStorage.getItem("accessLogs") || "[]");
      localStorage.setItem(
        "accessLogs",
        JSON.stringify([...storedLogs, newLog])
      );

      // Update state
      setRecords(updatedRecords);

      toast.success(`Access granted to ${recipientName}`);
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error("Failed to grant access");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Revoke access
  const revokeAccess = async (recordId, recipientAddress) => {
    try {
      setLoading(true);

      // Find the record
      const storedRecords = JSON.parse(
        localStorage.getItem("medicalRecords") || "[]"
      );
      const recordIndex = storedRecords.findIndex((r) => r.id === recordId);

      if (recordIndex === -1) {
        throw new Error("Record not found");
      }

      // Update record's sharedWith array
      const updatedRecords = [...storedRecords];
      const record = updatedRecords[recordIndex];

      // Remove from sharedWith
      record.sharedWith = record.sharedWith.filter(
        (sw) => sw.address !== recipientAddress
      );

      // Update localStorage
      localStorage.setItem("medicalRecords", JSON.stringify(updatedRecords));

      // Get recipient name for the log
      const accessLogs = JSON.parse(localStorage.getItem("accessLogs") || "[]");
      const recipientLog = accessLogs.find(
        (log) =>
          log.recordId === recordId && log.recipientAddress === recipientAddress
      );
      const recipientName = recipientLog
        ? recipientLog.recipientName
        : "Unknown recipient";

      // Update access logs
      const newLog = {
        id: Date.now().toString(),
        action: "ACCESS_REVOKED",
        recordId: recordId,
        recordName: record.name,
        recipientAddress,
        recipientName,
        timestamp: new Date().toISOString(),
      };

      const storedLogs = JSON.parse(localStorage.getItem("accessLogs") || "[]");
      localStorage.setItem(
        "accessLogs",
        JSON.stringify([...storedLogs, newLog])
      );

      // Update state
      setRecords(updatedRecords);

      toast.success(`Access revoked for ${recipientName}`);
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Failed to revoke access");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch access logs
  const fetchAccessLogs = async () => {
    try {
      setLoading(true);

      // In a real app, fetch from blockchain
      // For demo, we'll use localStorage
      const storedLogs = JSON.parse(localStorage.getItem("accessLogs") || "[]");

      // Wait a bit to simulate blockchain query
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAccessLog(storedLogs);
      return storedLogs;
    } catch (error) {
      console.error("Error fetching access logs:", error);
      toast.error("Failed to retrieve access logs");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch a file from IPFS
  const fetchFromIPFS = async (ipfsHash) => {
    try {
      setLoading(true);

      // In a real app, you would:
      // 1. Fetch the encrypted file from IPFS using the hash
      // 2. Decrypt the file using the user's key
      // 3. Return the decrypted file

      // For demo purposes, just simulate fetching
      console.log(`Fetching file with hash: ${ipfsHash}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, return the actual file
      setLoading(false);

      return {
        name: "medical_record.pdf",
        type: "application/pdf",
        size: 1024 * 1024 * 2.5, // 2.5 MB
        ipfsHash,
      };
    } catch (error) {
      setLoading(false);
      console.error("Error fetching from IPFS:", error);
      toast.error("Failed to retrieve file from decentralized storage");
      throw error;
    }
  };

  const value = {
    loading,
    records,
    accessLog,
    uploadToIPFS,
    fetchMedicalRecords,
    grantAccess,
    revokeAccess,
    fetchAccessLogs,
    fetchFromIPFS,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
