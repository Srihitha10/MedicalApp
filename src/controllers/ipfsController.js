import axios from "axios";

// Function to upload file to IPFS via our backend API
export const uploadToIPFS = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Add metadata to request if provided
  if (Object.keys(metadata).length > 0) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  try {
    console.log("Uploading file to IPFS via backend API...");

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

    // Return the IPFS hash from the response
    return response.data.ipfsHash;
  } catch (error) {
    // Enhanced error logging
    console.error("IPFS Upload Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.error || error.message,
    });

    throw new Error(
      "Failed to upload to IPFS: " +
        (error.response?.data?.error || error.message)
    );
  }
};
