const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Appointment = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    // assistant_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Assistant',
    //   required: true,
    // },
    status: {
      type: String,
      enum: ['pending', 'approved', 'canceled'],
      default: 'pending',
    },
    description: {
      type: String,
      trim: true,
    },
    schedule_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)
module.exports = mongoose.model('Appointment', Appointment)
