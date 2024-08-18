const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient'); // Adjust path as needed
const Doctor = require('../models/Doctor'); // Adjust path as needed
const Hospital = require('../models/Hospital'); // Adjust path as needed
const { verifyToken } = require('../middleware/verifyToken');

// POST endpoint to create an appointment
router.post('/', async (req, res) => {
  const { doctorId, patientId, hospitalId, description,scheduleDate } = req.body;


  try {
    // Validate doctor, patient, and hospital
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    const hospital = await Hospital.findById(hospitalId);

    console.log({doctor,patient,hospital})

    if (!doctor || !patient || !hospital) {
      return res.status(404).json({ message: 'Doctor, Patient, or Hospital not found' });
    }

    // Create a new appointment
    const appointment = new Appointment({
      doctor_id : doctorId,
      patient_id : patientId,
      hospital_id : hospitalId,
      description : description,
      schedule_date: scheduleDate,
      status: 'pending', // Default status
    });

    // Save the appointment
    await appointment.save();
    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:appointmentId/approve', verifyToken, async (req, res) => {
    const { appointmentId } = req.params;
    console.log({appointmentId})
    const user = req.user;
  
    if (user.role !== 'doctor') {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }
  
    try {
      // Find the appointment by ID
      const appointment = await Appointment.findById(appointmentId);
  
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      // Check if the logged-in doctor is the one assigned to this appointment
      if (appointment.doctor_id.toString() !== user.additionalInformation?._id.toString()) {
        return res.status(403).json({ message: 'You can only approve your own appointments' });
      }
  
      // Update the appointment status to approved
      appointment.status = 'approved';
      await appointment.save();
  
      res.status(200).json({ message: 'Appointment approved successfully', appointment });
    } catch (error) {
      console.error('Error approving appointment:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });

  router.get('/', verifyToken, async (req, res) => {
    const user = req.user;
    const hospitalId = req.header('hospitalId');
    const doctorId = req.header('doctorId');
    const date = req.header('date');  // Retrieve the date from the headers
    const status = req.header('status');  // Retrieve the status from the headers
  
    if (user.role !== 'doctor') {
      return res
        .status(403)
        .json({ message: 'You are not allowed to perform this action' });
    }
  
    if (!date) {
      return res
        .status(400)
        .json({ message: 'Date header is required' });
    }
  
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res
          .status(400)
          .json({ message: 'Invalid date format' });
      }
  
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
  
      // Build the query based on the status
      const query = {
        // doctor_id: user.additionalInformation?._id,
        doctor_id: doctorId,
        hospital_id: hospitalId,
        schedule_date: { $gte: startOfDay, $lt: endOfDay },
      };
  
      if (status && status !== 'all') {
        query.status = status;  // Add status to the query if it's not 'all'
      }
  
      // Find appointments based on the constructed query
      const appointments = await Appointment.find(query).populate('patient_id', 'name');
  
      res.status(200).json({ appointments });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

  router.get('/today', verifyToken, async (req, res) => {
    const user = req.user
    const hospitalId = req.header('hospitalId')
  
    if (user.role !== 'doctor') {
      return res
        .status(403)
        .json({ message: 'You are not allowed to perform this action' })
    }
  
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
  
      const tomorrow = new Date()
      tomorrow.setHours(23, 59, 59, 999)
  
      // Find appointments for today based on the `schedule_date` field
      const appointments = await Appointment.find({
        doctor_id: user.additionalInformation?._id,
        hospital_id: hospitalId,
        schedule_date: { $gte: today, $lt: tomorrow },
      }).populate('patient_id', 'name')
  
      res.status(200).json({ appointments })
    } catch (error) {
      console.error("Error fetching today's appointments:", error)
      res.status(500).json({ message: 'Server error', error })
    }
  })

module.exports = router;
