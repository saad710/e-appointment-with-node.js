const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Prescription = new Schema(
  {
    appointment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    pulse: {
      type: Number,
      required: true,
    },
    blood_pressure: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    blood_sugar: {
      type: Number,
      required: true,
    },
    hemoglobin: {
      type: Number,
      required: true,
    },
    allergy: {
      type: String,
      trim: true,
    },
    chief_complaint: {
      type: String,
      trim: true,
    },
    history: {
      type: String,
      trim: true,
    },
    findings: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    end_note: {
      type: String,
      trim: true,
    },
    follow_up_date: {
      type: Date,
    },
    medicines: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        route_form: {
          type: String,
          required: true,
        },
        no_of_days: {
          type: Number,
          required: true,
        },
        instructions: {
          type: String,
          trim: true,
        },
        additional_comments: {
          type: String,
          trim: true,
        },
      },
    ],
    tests: [
      {
        name: {
          type: String,
          required: true,
        },
        additional_comments: {
          type: String,
          trim: true,
        },
      },
    ],
    issued_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prescription', Prescription);

