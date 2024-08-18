const express = require("express");
const router = express.Router();
const WorkingDay = require("../models/WorkingDay");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const { verifyToken } = require("../middleware/verifyToken");

// Add multiple working days with different times for a doctor
router.post("/", verifyToken, async (req, res) => {
  const user = req.user;
  if (user.role !== "doctor") {
    return res.status(403).json("You are not allowed to do that!");
  }
  try {
    const { doctorId, hospitalId, schedule } = req.body;

    // Validate doctor and hospital
    const doctor = await Doctor.findById(doctorId);
    const hospital = await Hospital.findById(hospitalId);

    console.log({ doctorId, hospitalId });

    if (!doctor || !hospital) {
      return res.status(404).json({ message: "Doctor or Hospital not found" });
    }

    // Create multiple working day entries
    const workingDays = schedule.map(({ day, start_time, end_time }) => ({
      doctor_id: doctorId,
      hospital_id: hospitalId,
      day,
      start_time,
      end_time,
    }));

    await WorkingDay.insertMany(workingDays);

    // Update or add the hospital in the doctor's hospitals array
    const hospitalEntry = doctor.hospitals.find((h) => h.id.equals(hospitalId));

    if (hospitalEntry) {
      // Update the existing entry
      // hospitalEntry.schedule = schedule;
      return res.status(403).json({ message: "Hospital already exists" });
    } else {
      // Add a new entry
      doctor.hospitals.push({
        id: hospitalId,
        name: hospital.name,
        schedule: schedule,
      });
    }

    await doctor.save();

    res
      .status(201)
      .json({ message: "Working days added successfully", workingDays });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update multiple working days for a doctor
router.put("/", verifyToken, async (req, res) => {
  const user = req.user;
  if (user.role !== "doctor") {
    return res.status(403).json("You are not allowed to do that!");
  }

  try {
    const { doctorId, hospitalId, schedule } = req.body;

    // Validate doctor and hospital
    const doctor = await Doctor.findById(doctorId);
    const hospital = await Hospital.findById(hospitalId);

    if (!doctor || !hospital) {
      return res.status(404).json({ message: "Doctor or Hospital not found" });
    }

    // Delete existing working days for the doctor at the specified hospital
    await WorkingDay.deleteMany({
      doctor_id: doctorId,
      hospital_id: hospitalId,
    });

    // Create new working day entries
    const workingDays = schedule.map(({ day, start_time, end_time }) => ({
      doctor_id: doctorId,
      hospital_id: hospitalId,
      day,
      start_time,
      end_time,
    }));

    await WorkingDay.insertMany(workingDays);

    // Update the schedule in the doctor's hospitals array
    const hospitalEntry = doctor.hospitals.find((h) => h.id.equals(hospitalId));

    if (hospitalEntry) {
      // Update the existing entry
      hospitalEntry.schedule = schedule;
    } else {
      // Add a new entry if it doesn't exist
      doctor.hospitals.push({
        id: hospitalId,
        name: hospital.name,
        schedule: schedule,
      });
    }

    await doctor.save();

    res.status(200).json({
      message: "Working days and doctor schedule updated successfully",
      workingDays,
    });
  } catch (error) {
    console.error("Error updating working days and doctor schedule:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

//delete
router.delete("/", verifyToken, async (req, res) => {
  const user = req.user;
  if (user.role !== "doctor") {
    return res.status(403).json("You are not allowed to do that!");
  }

  try {
    const { doctorId, hospitalId } = req.body;

    // Validate doctor
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Remove the working days for the doctor at the specified hospital
    await WorkingDay.deleteMany({
      doctor_id: doctorId,
      hospital_id: hospitalId,
    });

    // Remove the hospital entry from the doctor's hospitals array
    doctor.hospitals = doctor.hospitals.filter((h) => !h.id.equals(hospitalId));

    await doctor.save();

    res.status(200).json({
      message: "Working days and hospital entry removed successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting working days and updating doctor schema:",
      error
    );
    res.status(500).json({ message: "Server error", error });
  }
});

// Get working days for a doctor at a specific hospital
// Get working days for a doctor at a specific hospital
router.get("/", async (req, res) => {
  try {
    const doctorId = req.header("doctorId");
    const hospitalId = req.header("hospitalId");

    // Validate doctorId and hospitalId?
    if (!doctorId || !hospitalId) {
      return res
        .status(400)
        .json({ message: "DoctorId and HospitalId are required" });
    }

    // Find working days for the doctor at the hospital
    const workingDays = await WorkingDay.find({
      doctor_id: doctorId,
      hospital_id: hospitalId,
    });

    if (!workingDays.length) {
      return res.status(404).json({ message: "No working days found" });
    }

    res.status(200).json({ workingDays });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
