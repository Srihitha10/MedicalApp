const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper to handle errors
const handleError = (res, error) => {
  console.error("IPFS Error:", error);
  return res.status(500).json({
    error: error.message || "Something went wrong with the IPFS operation",
  });
};

// Get Pinata JWT from environment variables - Fixed version
const getPinataJWT = () => {
  const jwt = process.env.PINATA_JWT;

  if (!jwt) {
    throw new Error("PINATA_JWT environment variable is not defined");
  }

  // Check if JWT already includes 'Bearer ' prefix
  return jwt.startsWith("Bearer ") ? jwt : `Bearer ${jwt}`;
};

// Upload file to IPFS via Pinata
router.post("/upload", upload.single("file"), async (req, res) => {
  let tempFilePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    console.log(`Uploading file ${req.file.originalname} to IPFS...`);

    // Create a temporary file path
    tempFilePath = path.join(
      __dirname,
      "..",
      "..",
      "temp",
      crypto.randomBytes(16).toString("hex") +
        path.extname(req.file.originalname)
    );

    // Ensure temp directory exists
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Parse any additional metadata if provided
    let metadata = {};
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch (e) {
        console.warn("Failed to parse metadata:", e);
      }
    }

    // Create form data for Pinata
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempFilePath));

    // Add metadata
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: req.file.originalname,
        keyvalues: {
          contentType: req.file.mimetype,
          size: req.file.size,
          ...metadata,
        },
      })
    );

    // Set options for Pinata
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );

    // Get JWT for authorization
    const jwt = getPinataJWT();
    console.log(
      "Using Pinata JWT (first 20 chars):",
      jwt.substring(0, 20) + "..."
    );

    // Send request to Pinata
    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: jwt,
          ...formData.getHeaders(),
        },
      }
    );

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Return the IPFS hash (CID) to the client
    res.status(200).json({
      success: true,
      ipfsHash: pinataResponse.data.IpfsHash,
      pinSize: pinataResponse.data.PinSize,
      timestamp: pinataResponse.data.Timestamp,
    });
  } catch (error) {
    // Clean up temporary file if it exists
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (e) {
      console.error("Error cleaning up temporary file:", e);
    }

    handleError(res, error);
  }
});

// Get file from IPFS via Pinata gateway
router.get("/:ipfsHash", async (req, res) => {
  try {
    const { ipfsHash } = req.params;

    if (!ipfsHash) {
      return res.status(400).json({ error: "No IPFS hash provided" });
    }

    console.log(`Retrieving file with hash ${ipfsHash} from IPFS...`);

    // Make request to Pinata gateway
    const response = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      {
        responseType: "arraybuffer",
      }
    );

    // Set appropriate headers based on content type
    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    // Return the file data
    res.status(200).send(Buffer.from(response.data));
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
