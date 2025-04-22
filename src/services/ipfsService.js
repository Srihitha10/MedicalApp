/**
 * IPFS Service
 *
 * This service handles interactions with the InterPlanetary File System (IPFS)
 * for decentralized storage of medical records.
 *
 * For a production environment, you'd want to connect to a real IPFS node
 * using libraries like ipfs-http-client or js-ipfs, but this mock service
 * simulates the functionality for development.
 */

import { encryptData, decryptData, hashData } from "./encryptionService";

// Mock IPFS Storage (in a real app, this would connect to actual IPFS nodes)
const mockIpfsStorage = {};

// Upload a file to IPFS
const uploadToIpfs = async (file, encryptionKey = null) => {
  try {
    // In a real implementation, this would use the IPFS HTTP API or js-ipfs
    console.log(`Preparing to upload file to IPFS: ${file.name}`);

    // Generate a content hash for the file
    const fileArrayBuffer = await file.arrayBuffer();
    const contentHash = await hashData(fileArrayBuffer);

    // If an encryption key is provided, encrypt the file before upload
    let ipfsContent;
    let isEncrypted = false;

    if (encryptionKey) {
      console.log("Encrypting file before IPFS upload...");
      ipfsContent = await encryptData(fileArrayBuffer, encryptionKey);
      isEncrypted = true;
    } else {
      // Store raw file content (not recommended for sensitive data)
      ipfsContent = fileArrayBuffer;
    }

    // In a real implementation, this would be the actual IPFS upload
    // For this mock, we'll store in our mock storage
    const ipfsHash = `ipfs-${contentHash.substring(0, 16)}-${Date.now()}`;
    mockIpfsStorage[ipfsHash] = {
      content: ipfsContent,
      name: file.name,
      type: file.type,
      size: file.size,
      isEncrypted: isEncrypted,
      uploadedAt: new Date().toISOString(),
    };

    console.log(`File uploaded to IPFS with hash: ${ipfsHash}`);

    // Return the IPFS hash/CID and metadata
    return {
      cid: ipfsHash,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      isEncrypted: isEncrypted,
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

// Retrieve a file from IPFS
const retrieveFromIpfs = async (ipfsHash, encryptionKey = null) => {
  try {
    console.log(`Retrieving file from IPFS with hash: ${ipfsHash}`);

    // In a real implementation, this would use IPFS HTTP API or js-ipfs
    // For this mock, we'll retrieve from our mock storage
    const storedData = mockIpfsStorage[ipfsHash];

    if (!storedData) {
      throw new Error(`File with hash ${ipfsHash} not found in IPFS`);
    }

    // If the content is encrypted and a key is provided, decrypt it
    let fileContent;

    if (storedData.isEncrypted && encryptionKey) {
      console.log("Decrypting file from IPFS...");
      const decryptedContent = await decryptData(
        storedData.content,
        encryptionKey
      );

      // Convert decrypted string back to appropriate format based on file type
      const contentType = storedData.type;
      if (
        contentType.startsWith("image/") ||
        contentType.startsWith("application/pdf")
      ) {
        // Handle binary file types
        fileContent = base64ToBlob(decryptedContent, contentType);
      } else {
        // Handle text file types
        fileContent = new Blob([decryptedContent], { type: contentType });
      }
    } else if (storedData.isEncrypted && !encryptionKey) {
      throw new Error("Cannot retrieve encrypted file without encryption key");
    } else {
      // Return unencrypted content
      fileContent = new Blob([storedData.content], { type: storedData.type });
    }

    // Return the file content and metadata
    return {
      content: fileContent,
      filename: storedData.name,
      contentType: storedData.type,
      size: storedData.size,
    };
  } catch (error) {
    console.error("Error retrieving from IPFS:", error);
    throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
  }
};

// Helper function to convert base64 to Blob
const base64ToBlob = (base64, contentType) => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

// Pin a file on IPFS to ensure it remains available
const pinIpfsFile = async (ipfsHash) => {
  try {
    console.log(`Pinning file with hash: ${ipfsHash}`);

    // In a real implementation, this would call the IPFS pin API
    // For this mock, we'll just mark it as pinned
    if (mockIpfsStorage[ipfsHash]) {
      mockIpfsStorage[ipfsHash].isPinned = true;
      mockIpfsStorage[ipfsHash].pinnedAt = new Date().toISOString();
      return true;
    } else {
      throw new Error(`File with hash ${ipfsHash} not found in IPFS`);
    }
  } catch (error) {
    console.error("Error pinning IPFS file:", error);
    throw new Error(`Failed to pin file on IPFS: ${error.message}`);
  }
};

// Unpin a file from IPFS
const unpinIpfsFile = async (ipfsHash) => {
  try {
    console.log(`Unpinning file with hash: ${ipfsHash}`);

    // In a real implementation, this would call the IPFS unpin API
    // For this mock, we'll just mark it as not pinned
    if (mockIpfsStorage[ipfsHash]) {
      mockIpfsStorage[ipfsHash].isPinned = false;
      return true;
    } else {
      throw new Error(`File with hash ${ipfsHash} not found in IPFS`);
    }
  } catch (error) {
    console.error("Error unpinning IPFS file:", error);
    throw new Error(`Failed to unpin file from IPFS: ${error.message}`);
  }
};

// Get IPFS gateway URL for a file (for direct access if appropriate)
const getIpfsGatewayUrl = (ipfsHash) => {
  // In a real app, this would be a public or private IPFS gateway
  return `https://ipfs.io/ipfs/${ipfsHash}`;
};

export const uploadToIPFS = async (file, metadata) => {
  try {
    // Your existing IPFS upload code
    const ipfsHash = await uploadToIpfs(file);

    // Save to MongoDB
    const recordData = {
      ipfsHash,
      fileName: file.name,
      recordType: metadata.recordType,
      doctorName: metadata.doctorName,
      date: metadata.date,
      patientId: metadata.patientId,
    };

    const response = await fetch("/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    });

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export {
  uploadToIpfs,
  retrieveFromIpfs,
  pinIpfsFile,
  unpinIpfsFile,
  getIpfsGatewayUrl,
};
