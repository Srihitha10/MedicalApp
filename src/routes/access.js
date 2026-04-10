const express = require("express");
const router = express.Router();
const AccessGrant = require("../models/AccessGrant");
const EmergencyAccessSession = require("../models/EmergencyAccessSession");
const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");

const isValidPatientId = (value) => {
  if (!/^\d+$/.test(String(value || ""))) return false;
  return Number.parseInt(String(value), 10) >= 1000;
};

const isValidDoctorPublicId = (value) => /^D\d{4,}$/.test(String(value || ""));

const normalizeGrantStatus = (grant) => {
  if (grant.status !== "active") return grant;
  if (grant.expiresAt && new Date(grant.expiresAt) <= new Date()) {
    grant.status = "expired";
  }
  return grant;
};

const hasValidEmergencySession = async ({ patientId, doctorId, sessionId }) => {
  const now = new Date();

  const criteria = {
    doctorId,
    patientId,
    status: "active",
    expiresAt: { $gt: now },
  };

  const session = sessionId
    ? await EmergencyAccessSession.findOne({ _id: sessionId, ...criteria })
    : await EmergencyAccessSession.findOne(criteria).sort({ createdAt: -1 });

  if (!session) return false;

  if (session.expiresAt <= now) {
    session.status = "expired";
    await session.save();
    return false;
  }

  return true;
};

// Grant normal access from patient to another person.
router.post("/grants", async (req, res) => {
  try {
    const {
      patientId,
      recipientId,
      granteePatientId,
      relationship,
      expiresAt,
      allowedRecordTypes,
      notes,
    } = req.body;

    const recipientIdentifier = String(
      recipientId || granteePatientId || "",
    ).trim();

    if (!patientId || !recipientIdentifier || !relationship) {
      return res.status(400).json({
        error: "patientId, recipientId and relationship are required",
      });
    }

    if (!isValidPatientId(patientId)) {
      return res.status(400).json({
        error: "Patient ID must be numeric and 1000 or greater",
      });
    }

    const owner = await User.findOne({ patientId }).select(
      "patientId name email",
    );
    if (!owner) {
      return res.status(404).json({
        error: "Access owner account was not found",
      });
    }

    let granteeUser = null;
    if (
      relationship === "doctor" &&
      isValidDoctorPublicId(recipientIdentifier)
    ) {
      granteeUser = await User.findOne({
        doctorPublicId: recipientIdentifier,
        role: "doctor",
      }).select("patientId doctorPublicId name email role");
    } else if (isValidPatientId(recipientIdentifier)) {
      granteeUser = await User.findOne({
        patientId: recipientIdentifier,
      }).select("patientId doctorPublicId name email role");
    }

    if (!granteeUser) {
      return res.status(400).json({
        error:
          relationship === "doctor"
            ? "No doctor account exists with this doctor ID or patient ID"
            : "No account exists with this patient ID",
      });
    }

    if (patientId === granteeUser.patientId) {
      return res.status(400).json({
        error: "You cannot grant access to your own patient ID",
      });
    }

    const existingGrant = await AccessGrant.findOne({
      patientId,
      granteePatientId: granteeUser.patientId,
      status: "active",
    });
    if (existingGrant) {
      return res.status(400).json({
        error: "This patient already has active access",
      });
    }

    const grant = new AccessGrant({
      patientId,
      granteeId: granteeUser.patientId,
      granteePatientId: granteeUser.patientId,
      granteeDoctorPublicId: granteeUser.doctorPublicId || undefined,
      granteeName: granteeUser.name,
      granteeEmail: granteeUser.email,
      relationship,
      allowedRecordTypes: Array.isArray(allowedRecordTypes)
        ? allowedRecordTypes
        : [],
      notes: notes || "",
      expiresAt: expiresAt || null,
      status: "active",
    });

    const saved = await grant.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error creating access grant:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all grants created by a patient.
router.get("/grants", async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    const grants = await AccessGrant.find({ patientId }).sort({
      createdAt: -1,
    });
    const normalized = grants.map((grant) => normalizeGrantStatus(grant));
    await Promise.all(
      normalized
        .filter(
          (grant) => grant.status === "expired" && grant.isModified("status"),
        )
        .map((grant) => grant.save()),
    );

    res.json(normalized);
  } catch (error) {
    console.error("Error fetching patient grants:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get active grants available for a specific user (family/friend/doctor).
router.get("/grants/for", async (req, res) => {
  try {
    const { granteePatientId, granteeId } = req.query;
    const granteeIdentifier = String(
      granteePatientId || granteeId || "",
    ).trim();

    if (!granteeIdentifier) {
      return res
        .status(400)
        .json({ error: "granteePatientId or granteeId is required" });
    }

    const now = new Date();
    const grants = await AccessGrant.find({
      status: "active",
      $and: [
        {
          $or: [
            { granteePatientId: granteeIdentifier },
            { granteeDoctorPublicId: granteeIdentifier },
          ],
        },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      ],
    }).sort({ createdAt: -1 });

    res.json(grants);
  } catch (error) {
    console.error("Error fetching grants for user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Revoke a grant.
router.put("/grants/:grantId/revoke", async (req, res) => {
  try {
    const grant = await AccessGrant.findById(req.params.grantId);

    if (!grant) {
      return res.status(404).json({ error: "Grant not found" });
    }

    grant.status = "revoked";
    await grant.save();

    res.json({ success: true, grant });
  } catch (error) {
    console.error("Error revoking grant:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start emergency doctor access (max 2 hours).
router.post("/emergency/start", async (req, res) => {
  try {
    const { doctorId, patientId, reason, durationHours } = req.body;

    if (!doctorId || !patientId || !reason) {
      return res.status(400).json({
        error: "doctorId, patientId and reason are required",
      });
    }

    if (!isValidPatientId(patientId)) {
      return res.status(400).json({
        error: "Patient ID must be numeric and 1000 or greater",
      });
    }

    const doctorLookup = String(doctorId || "").trim();
    const doctorUser = await User.findOne({
      $or: [{ patientId: doctorLookup }, { doctorPublicId: doctorLookup }],
    }).select("patientId doctorPublicId name email role");

    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(403).json({
        error:
          "Emergency access is allowed only for registered doctor accounts",
      });
    }

    const patientUser = await User.findOne({ patientId }).select("patientId");
    if (!patientUser) {
      return res.status(404).json({
        error: "No patient account exists with this patient ID",
      });
    }

    const hours = Math.min(2, Math.max(1, Number(durationHours) || 2));
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + hours * 60 * 60 * 1000);

    const session = new EmergencyAccessSession({
      doctorId: doctorUser.patientId,
      doctorEmail: doctorUser.email,
      doctorName: doctorUser.name || "Doctor",
      patientId,
      reason,
      durationHours: hours,
      startedAt,
      expiresAt,
      status: "active",
    });

    const saved = await session.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error starting emergency session:", error);
    res.status(500).json({ error: error.message });
  }
});

// End emergency doctor access.
router.post("/emergency/end/:sessionId", async (req, res) => {
  try {
    const session = await EmergencyAccessSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.status = "ended";
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    console.error("Error ending emergency session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get active emergency sessions for doctor.
router.get("/emergency/active", async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required" });
    }

    const now = new Date();
    await EmergencyAccessSession.updateMany(
      {
        doctorId,
        status: "active",
        expiresAt: { $lte: now },
      },
      { $set: { status: "expired" } },
    );

    const sessions = await EmergencyAccessSession.find({
      doctorId,
      status: "active",
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching active emergency sessions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get emergency history for a doctor (active + ended + expired).
router.get("/emergency/history", async (req, res) => {
  try {
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required" });
    }

    const now = new Date();
    await EmergencyAccessSession.updateMany(
      {
        doctorId,
        status: "active",
        expiresAt: { $lte: now },
      },
      { $set: { status: "expired" } },
    );

    const sessions = await EmergencyAccessSession.find({ doctorId }).sort({
      createdAt: -1,
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching emergency history:", error);
    res.status(500).json({ error: error.message });
  }
});

// Secure record read endpoint with ABAC-style checks.
router.get("/patients/:patientId/records", async (req, res) => {
  try {
    const { patientId } = req.params;
    const { requesterId, requesterRole, sessionId } = req.query;

    if (!requesterId || !requesterRole) {
      return res
        .status(400)
        .json({ error: "requesterId and requesterRole are required" });
    }

    const isAdmin = requesterRole === "admin";
    const isOwner = requesterId === patientId;

    if (isAdmin || isOwner) {
      const records = await MedicalRecord.find({ patientId }).sort({
        createdAt: -1,
      });
      return res.json({ records, accessMode: isAdmin ? "admin" : "owner" });
    }

    let accessMode = "none";
    let allowedRecordTypes = null;

    if (requesterRole === "doctor") {
      const emergencyAllowed = await hasValidEmergencySession({
        patientId,
        doctorId: requesterId,
        sessionId,
      });

      if (emergencyAllowed) {
        accessMode = "emergency";
      }
    }

    const now = new Date();
    const grants = await AccessGrant.find({
      patientId,
      status: "active",
      $and: [
        { granteePatientId: requesterId },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      ],
    });

    if (grants.length > 0) {
      accessMode = accessMode === "emergency" ? "emergency+grant" : "grant";

      const allTypes = grants
        .map((grant) => grant.allowedRecordTypes || [])
        .flat()
        .filter(Boolean);

      if (allTypes.length > 0) {
        allowedRecordTypes = [...new Set(allTypes)];
      }
    }

    if (accessMode === "none") {
      return res.status(403).json({
        error: "No active permission to access this patient's records",
      });
    }

    const query = { patientId };
    if (allowedRecordTypes && accessMode === "grant") {
      query.recordType = { $in: allowedRecordTypes };
    }

    const records = await MedicalRecord.find(query).sort({ createdAt: -1 });
    return res.json({ records, accessMode, allowedRecordTypes });
  } catch (error) {
    console.error("Error reading patient records with access control:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
