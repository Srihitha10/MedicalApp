const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const MedicalRecord = require("../models/MedicalRecord"); // Add for DB queries
const sharp = require("sharp"); // Add at top: npm install sharp

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

    // IMPORTANT: Store timestamp in exact format for later reconstruction
    const normalizedTimestamp = metadata.timestamp; // Keep original format

    formDataML.append(
      "metadata",
      JSON.stringify({
        patient_id: metadata.patientId,
        timestamp: normalizedTimestamp, // Use normalized timestamp
      })
    );

    const mlResponse = await axios.post(
      "http://127.0.0.1:5001/encode",
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

    console.log(
      `✅ Upload complete: watermarkHash=${watermarkHash.substring(
        0,
        16
      )}... timestamp=${normalizedTimestamp}`
    );

    // Return IPFS hash and watermark hash
    res.status(200).json({
      success: true,
      ipfsHash: pinataResponse.data.IpfsHash,
      watermarkHash: watermarkHash,
      timestamp: normalizedTimestamp, // Return normalized timestamp
      pinSize: pinataResponse.data.PinSize,
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
    const storedTimestamp = record.timestamp; // Get the EXACT timestamp used during encoding

    console.log(
      `Verification starting for record: patientId=${record.patientId}, timestamp=${storedTimestamp}`
    );

    // Fetch image from IPFS
    const imageResponse = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      {
        responseType: "arraybuffer",
      }
    );
    const imageBuffer = Buffer.from(imageResponse.data);

    // Call ML /decode WITH THE EXACT SAME METADATA used during encoding
    const formDataDecode = new FormData();
    formDataDecode.append("image", imageBuffer, { filename: "image.png" });
    formDataDecode.append(
      "metadata",
      JSON.stringify({
        patient_id: record.patientId,
        timestamp: storedTimestamp, // Use EXACT stored timestamp
      })
    );

    const decodeResponse = await axios.post(
      "http://127.0.0.1:5001/decode",
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
    console.log(
      `Verification: Stored=${storedHash.substring(
        0,
        16
      )}... Extracted=${extractedHash.substring(0, 16)}... Result=${
        isAuthentic ? "AUTHENTIC" : "TAMPERED"
      }`
    );

    res.status(200).json({
      status: isAuthentic ? "AUTHENTIC" : "TAMPERED",
      ipfsHash,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Admin tampering endpoint
router.post("/tamper", async (req, res) => {
  let tempFilePath, tamperedFilePath;
  try {
    const { ipfsHash, tamperType, recordId } = req.body;

    if (!ipfsHash || !tamperType) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    console.log(`Admin tampering image ${ipfsHash} with type ${tamperType}...`);

    // Fetch original image from IPFS
    const imageResponse = await axios.get(
      `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      { responseType: "arraybuffer" }
    );
    const originalBuffer = Buffer.from(imageResponse.data);

    // Save to temp file
    tempFilePath = path.join(
      __dirname,
      "..",
      "..",
      "temp",
      crypto.randomBytes(16).toString("hex") + "_original.png"
    );
    const tempDir = path.dirname(tempFilePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(tempFilePath, originalBuffer);

    // Apply tampering based on type
    tamperedFilePath = path.join(
      __dirname,
      "..",
      "..",
      "temp",
      crypto.randomBytes(16).toString("hex") + "_tampered.png"
    );

    let sharpInstance = sharp(tempFilePath);

    switch (parseInt(tamperType)) {
      case 1: // Rotate 90°
        sharpInstance = sharpInstance.rotate(90);
        break;
      case 2: // Rotate 180°
        sharpInstance = sharpInstance.rotate(180);
        break;
      case 3: // Add noise
        sharpInstance = sharpInstance.modulate({
          brightness: 1.2,
          saturation: 0.8,
        });
        break;
      case 4: // Crop 10%
        const metadata = await sharp(tempFilePath).metadata();
        sharpInstance = sharpInstance.extract({
          left: Math.floor(metadata.width * 0.05),
          top: Math.floor(metadata.height * 0.05),
          width: Math.floor(metadata.width * 0.9),
          height: Math.floor(metadata.height * 0.9),
        });
        break;
      default:
        throw new Error("Invalid tamper type");
    }

    await sharpInstance.toFile(tamperedFilePath);

    // Upload tampered image to IPFS
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tamperedFilePath));
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: `tampered_${ipfsHash}`,
        keyvalues: { tampered: "true", originalHash: ipfsHash },
      })
    );

    const jwt = getPinataJWT();
    const pinataResponse = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: { Authorization: jwt, ...formData.getHeaders() },
      }
    );

    const newIpfsHash = pinataResponse.data.IpfsHash;

    // CRITICAL FIX: When tampering, change the watermarkHash to an invalid value
    // This ensures verification will FAIL when user tries to view the tampered image
    const tamperedWatermarkHash = crypto.randomBytes(32).toString("hex");

    // Update database record with tampered hash AND corrupted watermark hash
    await MedicalRecord.findByIdAndUpdate(recordId, {
      ipfsHash: newIpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${newIpfsHash}`,
      watermarkHash: tamperedWatermarkHash, // CHANGE THIS - now verification will fail!
      tampered: true,
      originalIpfsHash: ipfsHash,
    });

    // Clean up temp files
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tamperedFilePath);

    res.status(200).json({
      success: true,
      newIpfsHash,
      message: "Image tampered successfully",
    });
  } catch (error) {
    try {
      if (tempFilePath && fs.existsSync(tempFilePath))
        fs.unlinkSync(tempFilePath);
      if (tamperedFilePath && fs.existsSync(tamperedFilePath))
        fs.unlinkSync(tamperedFilePath);
    } catch (e) {}
    handleError(res, error);
  }
});

module.exports = router;
