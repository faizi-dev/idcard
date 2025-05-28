const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  photoUrl: String,
  fullName: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date, 
    required: true 
  },
  mobileNumber: { 
    type: String, 
    required: true,
    match: /^[0-9]{10}$/
  },
  prnNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  rollNumber: { 
    type: String, 
    required: true 
  },
  yearOfJoining: { 
    type: Number, 
    required: true 
  },
  courseName: { 
    type: String, 
    required: true 
  },
  qrCode: String,
  cardValidity: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);