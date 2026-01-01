import axios from "axios";

// Function to upload file to IPFS via our backend API
export const uploadToIPFS = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Ensure patientId and timestamp are included in metadata
  if (!metadata.patientId) {
    throw new Error("Patient ID is required");
  }
  if (!metadata.timestamp) {
    throw new Error("Timestamp is required");
  }

  // Add metadata to request - IMPORTANT: must include patientId and timestamp
  console.log("Sending metadata:", metadata);
  formData.append(
    "metadata",
    JSON.stringify({
      patientId: metadata.patientId,
      timestamp: metadata.timestamp,
      fileName: metadata.fileName,
      recordType: metadata.recordType,
      doctorName: metadata.doctorName,
      description: metadata.description,
    })
  );

  try {
    console.log("Uploading file to IPFS via backend API...");
    console.log("Metadata being sent:", {
      patientId: metadata.patientId,
      timestamp: metadata.timestamp,
    });

    // Make request to our backend API
    const response = await axios.post(
      "http://localhost:5000/api/ipfs/upload", // Adjust this URL based on your API host/port
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log("IPFS Upload successful:", response.data);

    // Return the IPFS hash and watermark hash from the response
    return {
      ipfsHash: response.data.ipfsHash,
      watermarkHash: response.data.watermarkHash,
    };
  } catch (error) {
    // Enhanced error logging
    console.error("IPFS Upload Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error || error.message,
      data: error.response?.data,
    });

    throw new Error(
      "Failed to upload to IPFS: " +
        (error.response?.data?.error || error.message)
    );
  }
};
