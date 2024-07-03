const router = require("express").Router();
const { validationResult } = require("express-validator");
const multer = require("multer");
const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyToken,
} = require("../middleware/verifyToken");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

router.get("/details", verifyToken, async (req, res) => {
  const user = req.user;

  // Validate user object
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const additionalInfo = user.additionalInformation || {};
  const fieldsToExclude = ['_id', 'user_id'];
  const totalFields = Object.keys(additionalInfo).filter(key => !fieldsToExclude.includes(key)).length;
  const filledFields = Object.keys(additionalInfo).filter(
    key => !fieldsToExclude.includes(key) && additionalInfo[key]
  ).length;
  const profileCompletion = Math.round((filledFields / totalFields) * 100);

  res.status(200).json({
    ...user,
    profile_complete: profileCompletion,
  });
  // Respond with user data
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploads to 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Append current timestamp to file name
  },
});

// Filter file types (accept only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).fields([
  { name: "profile_picture", maxCount: 1 },
  { name: "signature_photo", maxCount: 1 },
]);

// Update user profile
router.put("/:id", verifyTokenAndAuthorization, upload, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Prepare updated user data
  const updateFields = { ...req.body };

  console.log('files', req.files)
  if (req.files) {
    if (req.files.profile_picture) {
      updateFields.profile_picture = req.files.profile_picture[0].path.replace(
        /\\/g,
        "/"
      );
    }
    if (req.files.signature_photo) {
      updateFields.signature_photo = req.files.signature_photo[0].path.replace(
        /\\/g,
        "/"
      );
    }
  }

  console.log({updateFields})

  try {
    // Update user data
    let updatedUser;
    if (req.user.role === "patient") {
      updatedUser = await Patient.findOneAndUpdate(
        { user_id: req.params.id }, // Search by user_id
        { $set: updateFields }, // Update the specified fields
        { new: true } // Return the updated document
      );
    } else {
      updatedUser = await Doctor.findOneAndUpdate(
        { user_id: req.params.id }, // Search by user_id
        { $set: updateFields }, // Update the specified fields
        { new: true } // Return the updated document
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
