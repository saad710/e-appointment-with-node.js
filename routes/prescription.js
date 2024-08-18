const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");


// POST API to save a prescription
router.post('/', async (req, res) => {
    try {
      const prescriptionData = req.body;
      const newPrescription = new Prescription(prescriptionData);
      const savedPrescription = await newPrescription.save();
      res.status(201).json(savedPrescription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// GET API to retrieve prescriptions by appointment_id
router.get('/', async (req, res) => {
    try {
      const { appointment_id } = req.query;
      if (!appointment_id) {
        return res.status(400).json({ message: 'Appointment ID is required' });
      }
      const prescriptions = await Prescription.find({ appointment_id });
      res.status(200).json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;