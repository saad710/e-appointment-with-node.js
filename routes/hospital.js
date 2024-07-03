const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");

// @route   POST api/hospitals
// @desc    Register a new hospital
// @access  Public
router.post("/", async (req, res) => {
  const { name, address, phone, email, registration_number } = req.body;

  try {
    let hospital = new Hospital({
      name,
      address,
      phone,
      email,
      registration_number,
    });

    await hospital.save();
    res.status(201).json(hospital);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get('/', async (req, res) => {
    
    try {
        const hospitals = await Hospital.find()
      
          if (!hospitals.length) {
            return res.status(404).json({ message: 'No Hospitals found' })
          }
      
          res.status(200).json({ hospitals })
        } catch (error) {
          res.status(500).json({ message: 'Server error', error })
        }
});

router.get("/:hospitalId/doctors", async (req, res) => {
  const { hospitalId } = req.params;

  try {
    // Find doctors associated with the specified hospital
    const doctors = await Doctor.find({ "hospitals.id": hospitalId }).populate(
      "user_id",
      "name"
    );

    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No doctors found for this hospital" });
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors for the hospital:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
