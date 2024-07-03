const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workingDay = new Schema({
  doctor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  hospital_id: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  start_time: {
    type: String,
    required: true,
  },
  end_time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('WorkingDay', workingDay);
