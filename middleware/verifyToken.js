const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const jwt = require("jsonwebtoken");

//only_token_verify_and_find_user_from_req
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log({ token });
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    console.log({ user });

    if (!user) {
      return res.status(401).json({ error: "Invalid token." });
    }

    let additionalData = {};

    if (user.role === "doctor") {
      additionalData = await Doctor.findOne({ user_id: user._id }).lean();
    } else if (user.role === "patient") {
      additionalData = await Patient.findOne({ user_id: user._id }).lean();
    }

    req.user = { ...user.toObject(), additionalInformation: additionalData };

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

//access_authorization_user
const verifyTokenAndAuthorization = async (req, res, next) => {
  try {
    await verifyToken(req, res, () => {
      if (req.user._id.toString() === req.params.id || req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not allowed to do that!");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
};
