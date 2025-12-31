const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const MedicalRecord = require("../models/MedicalRecord"); // Add for DB queries

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

// Upload file to IPFS via Pinata (modified for watermarking)
router.post("/upload", upload.single("file"), async (req, res) => {
  let tempFilePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    console.log(`Uploading file ${req.file.originalname} to IPFS...`);

    // Parse metadata (must include patientId and timestamp for watermarking)
    let metadata = {};
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch (e) {
        console.warn("Failed to parse metadata:", e);
        return res.status(400).json({ error: "Invalid metadata JSON" });
      }
    }
    if (!metadata.patientId || !metadata.timestamp) {
      return res
        .status(400)
        .json({ error: "Metadata must include patientId and timestamp" });
    }

    // Call ML /encode to watermark the image
    const formDataML = new FormData();
    formDataML.append("image", req.file.buffer, {
      filename: req.file.originalname,
    });
    formDataML.append(
      "metadata",
      JSON.stringify({
        patient_id: metadata.patientId,
        timestamp: metadata.timestamp,
      })
    );
    const mlResponse = await axios.post(
      "http://127.0.0.1:5001/encode", // Changed from localhost to 127.0.0.1
      formDataML,
      {
        headers: formDataML.getHeaders(),
        maxBodyLength: Infinity,
      }
    );
    if (mlResponse.data.error) {
      return res
        .status(500)
        .json({ error: "ML encoding failed: " + mlResponse.data.error });
    }
    const watermarkedImageBase64 = mlResponse.data.watermarked_image;
    const watermarkHash = mlResponse.data.watermark_hash;
    const watermarkedBuffer = Buffer.from(watermarkedImageBase64, "base64");

    // Create temporary file for watermarked image
    tempFilePath = path.join(
      __dirname,
      "..",
      "..",
      "temp",
      crypto.randomBytes(16).toString("hex") + ".png"
    );
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempFilePath, watermarkedBuffer);

    // Create form data for Pinata with watermarked image
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempFilePath));
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: req.file.originalname,
        keyvalues: {
          contentType: "image/png", // Watermarked as PNG
          size: watermarkedBuffer.length,
          ...metadata,
        },
      })
    );
    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      })
    );

    // Get JWT and upload to Pinata
    const jwt = getPinataJWT();
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

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Return IPFS hash and watermark hash
    res.status(200).json({
      success: true,
      ipfsHash: pinataResponse.data.IpfsHash,
      watermarkHash: watermarkHash,
      pinSize: pinataResponse.data.PinSize,
      timestamp: pinataResponse.data.Timestamp,
    });
  } catch (error) {
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

// New endpoint for authenticity verification
router.post("/verify", async (req, res) => {
  try {
    const { ipfsHash } = req.body;
    if (!ipfsHash) {
      return res.status(400).json({ error: "IPFS hash required" });
    }

    // Fetch stored watermark hash from DB
    const record = await MedicalRecord.findOne({ ipfsHash });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    const storedHash = record.watermarkHash;

    // Fetch image from IPFS
    const imageResponse = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      {
        responseType: "arraybuffer",
      }
    );
    const imageBuffer = Buffer.from(imageResponse.data);

    // Call ML /decode
    const formDataDecode = new FormData();
    formDataDecode.append("image", imageBuffer, { filename: "image.png" });
    const decodeResponse = await axios.post(
      "http://127.0.0.1:5001/decode", // Changed from localhost to 127.0.0.1
      formDataDecode,
      {
        headers: formDataDecode.getHeaders(),
      }
    );
    if (decodeResponse.data.error) {
      return res
        .status(500)
        .json({ error: "ML decoding failed: " + decodeResponse.data.error });
    }
    const extractedHash = decodeResponse.data.extracted_watermark_hash;

    // Compare hashes
    const isAuthentic = extractedHash === storedHash;
    res.status(200).json({
      status: isAuthentic ? "AUTHENTIC" : "TAMPERED",
      ipfsHash,
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
