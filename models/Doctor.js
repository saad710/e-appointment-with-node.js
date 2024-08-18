const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const doctorSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    full_name: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    registration_no: {
      type: String,
      trim: true,
    },
    qualifications: {
      type: String,
    },
    profile_picture: {
      type: String,
      trim: true,
    },
    signature_photo: {
      type: String,
      trim: true,
    },
    hospitals: [{
      id: {
        type: Schema.Types.ObjectId,
        ref: "Hospital",
      },
      name: String,
      schedule: [{
        day: String,
        start_time : String,
        end_time : String
      }]
    }],
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
