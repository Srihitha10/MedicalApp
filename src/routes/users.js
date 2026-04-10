const express = require("express");
const router = express.Router();
const User = require("../models/User");

const generateUniquePatientId = async () => {
  const [highestPatient] = await User.aggregate([
    {
      $match: {
        patientId: { $exists: true, $ne: null },
      },
    },
    {
      $addFields: {
        patientIdNumber: { $toInt: "$patientId" },
      },
    },
    {
      $sort: { patientIdNumber: -1 },
    },
    {
      $limit: 1,
    },
    {
      $project: { patientId: 1, patientIdNumber: 1 },
    },
  ]);

  if (!highestPatient?.patientId) {
    return "1000";
  }

  const maxId = Number.parseInt(
    highestPatient.patientIdNumber ?? highestPatient.patientId,
    10,
  );
  if (!Number.isFinite(maxId) || maxId < 1000) {
    return "1000";
  }

  return String(maxId + 1);
};

const generateUniqueDoctorPublicId = async () => {
  const [highestDoctor] = await User.aggregate([
    {
      $match: {
        doctorPublicId: { $exists: true, $ne: null, $regex: /^D\d+$/ },
      },
    },
    {
      $addFields: {
        doctorPublicIdNumber: {
          $toInt: {
            $substrCP: ["$doctorPublicId", 1, { $strLenCP: "$doctorPublicId" }],
          },
        },
      },
    },
    {
      $sort: { doctorPublicIdNumber: -1 },
    },
    {
      $limit: 1,
    },
    {
      $project: { doctorPublicId: 1, doctorPublicIdNumber: 1 },
    },
  ]);

  if (!highestDoctor?.doctorPublicId) {
    return "D1000";
  }

  const maxId = Number.parseInt(
    highestDoctor.doctorPublicIdNumber ??
      String(highestDoctor.doctorPublicId).slice(1),
    10,
  );

  if (!Number.isFinite(maxId) || maxId < 1000) {
    return "D1000";
  }

  return `D${maxId + 1}`;
};

// Get all users
router.get("/", async (req, res) => {
  try {
    console.log("📋 Getting all users...");
    const users = await User.find().select("-password");
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    console.log(
      "📝 Creating user with data:",
      JSON.stringify(req.body, null, 2),
    );

    if (!req.body) {
      console.error("❌ Request body is missing");
      return res.status(400).json({ error: "Request body is missing" });
    }

    const { name, email, password, role, hospitalName, doctorID } = req.body;

    // Check for required fields
    if (!name) {
      console.error("❌ Username is required");
      return res.status(400).json({ error: "Username is required" });
    }

    if (!email) {
      console.error("❌ Email is required");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!password) {
      console.error("❌ Password is required");
      return res.status(400).json({ error: "Password is required" });
    }

    // Doctor-specific validation
    if (role === "doctor") {
      if (!hospitalName) {
        console.error("❌ Hospital name is required for doctors");
        return res
          .status(400)
          .json({ error: "Hospital name is required for doctors" });
      }
      if (!doctorID) {
        console.error("❌ Doctor ID is required");
        return res.status(400).json({ error: "Doctor ID is required" });
      }
    }

    console.log("🔍 Checking if user already exists...");

    // Check if user already exists by name or email
    const existingUserByName = await User.findOne({ name });
    if (existingUserByName) {
      console.error("❌ Username already exists");
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.error("❌ Email already registered");
      return res.status(400).json({ error: "Email already registered" });
    }

    console.log("✅ Validation passed, creating new user...");

    const patientId = await generateUniquePatientId();
    const doctorPublicId =
      role === "doctor" ? await generateUniqueDoctorPublicId() : null;

    // Create new user with the required fields
    const newUser = new User({
      name,
      email,
      password,
      patientId,
      role: role || "user",
      ...(role === "doctor" && { hospitalName, doctorID, doctorPublicId }),
    });

    // Save user to database
    console.log("💾 Saving user to database...");
    const savedUser = await newUser.save();
    console.log("✅ User created successfully:", savedUser._id);

    // Return user without password
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("❌ Error creating user:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error code:", error.code);
    res.status(500).json({ error: error.message });
  }
});

// Login using registered account details
router.post("/login", async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.patientId) {
      user.patientId = await generateUniquePatientId();
      await user.save();
    }

    if (user.role === "doctor" && !user.doctorPublicId) {
      user.doctorPublicId = await generateUniqueDoctorPublicId();
      await user.save();
    }

    if (expectedRole && user.role !== expectedRole) {
      return res
        .status(403)
        .json({ error: `This account is not a ${expectedRole}` });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
