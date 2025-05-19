const axios = require("axios");
const FormData = require("form-data");

// Get JWT token from environment variables
const getPinataJWT = () => {
  return process.env.REACT_APP_PINATA_JWT;
};

// Function to upload file to IPFS
const uploadFileToIPFS = async (file) => {
  const form = new FormData();
  form.append("file", file);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
          Authorization: `Bearer ${getPinataJWT()}`,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Error uploading file to IPFS");
  }
};

// Function to upload metadata to IPFS
const uploadMetadataToIPFS = async (metadata) => {
  const form = new FormData();
  form.append("file", JSON.stringify(metadata));

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      form,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${form._boundary}`,
          Authorization: `Bearer ${getPinataJWT()}`,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Error uploading metadata to IPFS");
  }
};

module.exports = {
  uploadFileToIPFS,
  uploadMetadataToIPFS,
};
