const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Validation middleware for registering new users
const registerValidation = [
  // Validate role
  body("role").notEmpty().withMessage("Role is required."),
  // Validate email
  body("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .notEmpty()
    .withMessage("Email is required."),
  // Validate password
  body("password").notEmpty().withMessage("Password is required."),
];

// Route handler for user registration
router.post("/register", registerValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { role, email, password } = req.body;

  // Validate that password is a string
  if (typeof password !== "string") {
    return res.status(400).json({ error: "Password must be a string" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Ensure password is a string

    // Create new user
    const newUser = new User({
      role: role,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save(); // Await the save operation
    if (role === "patient") {
      const newPatient = new Patient({
        user_id: savedUser._id,
        name: "",
        profile_picture: "", // Or use req.body.profile_picture if provided
      });
      await newPatient.save();
    } else if (role === "doctor") {
      const newDoctor = new Doctor({
        user_id: savedUser._id,
        name: "",
        profile_picture: "", // Ensure specialty is provided in req.body
        // other fields if any
      });
      await newDoctor.save();
    }
    const token = jwt.sign({ id: savedUser._id }, process.env.SECRET_KEY, {
      expiresIn: 86400, // expires in 24 hours
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email")
      .notEmpty()
      .withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      console.log({ validPassword });
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // User authenticated, generate token
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
        expiresIn: 86400, // expires in 24 hours
      });

      // Send token as response
      res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
