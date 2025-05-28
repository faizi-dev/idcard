const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const XLSX = require('xlsx');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Set up MongoDB connection
// Note: In a real application, you would use environment variables for the connection string
mongoose.connect('mongodb://localhost:27017/medical-student-id', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'photo') {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
    } else if (file.fieldname === 'bulkFile') {
      if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
        return cb(new Error('Only Excel or CSV files are allowed!'), false);
      }
    }
    cb(null, true);
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Define Student schema
const studentSchema = new mongoose.Schema({
  photoUrl: String,
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  mobileNumber: { type: String, required: true },
  prnNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  yearOfJoining: { type: Number, required: true },
  courseName: { type: String, required: true },
  qrCode: String,
  cardValidity: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Student model
const Student = mongoose.model('Student', studentSchema);

// API Routes

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
    
    // Mock response for demo
    //res.json([]);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
    
    // Mock response for demo
    //res.status(404).json({ error: 'Student not found' });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register a new student
app.post('/api/students', upload.single('photo'), async (req, res) => {
  try {
    const {
      fullName,
      address,
      dateOfBirth,
      mobileNumber,
      prnNumber,
      rollNumber,
      yearOfJoining,
      courseName
    } = req.body;
    
    // Generate QR code
    const qrCodeData = `http://medical-college.edu/students/${prnNumber}`;
    const qrCodeFileName = `qr_${prnNumber}.png`;
    const qrCodePath = path.join('uploads', qrCodeFileName);
    
    // Calculate card validity (1 year from now)
    const cardValidity = new Date();
    cardValidity.setFullYear(cardValidity.getFullYear() + 1);
    
    // Create new student
    const student = new Student({
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fullName,
      address,
      dateOfBirth,
      mobileNumber,
      prnNumber,
      rollNumber,
      yearOfJoining: parseInt(yearOfJoining),
      courseName,
      qrCode: `/uploads/${qrCodeFileName}`,
      cardValidity
    });
    
    // Generate and save QR code
    await QRCode.toFile(qrCodePath, qrCodeData);
    
    // Save student to database
    await student.save();
    
    // Return the new student
    res.status(201).json(student);
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a student
app.put('/api/students/:id', upload.single('photo'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Update fields
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.file) {
      updateData.photoUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    // Mock response for demo
    //res.status(404).json({ error: 'Student not found' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Delete associated files
    if (student.photoUrl) {
      const photoPath = path.join(__dirname, '..', student.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    if (student.qrCode) {
      const qrPath = path.join(__dirname, '..', student.qrCode);
      if (fs.existsSync(qrPath)) {
        fs.unlinkSync(qrPath);
      }
    }
    
    res.json({ message: 'Student deleted successfully' });
    
    // Mock response for demo
    //res.status(404).json({ error: 'Student not found' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload students
app.post('/api/students/bulk', upload.single('bulkFile'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const results = {
      total: data.length,
      success: 0,
      errors: 0,
      records: []
    };
    
    // Process each record
    for (const record of data) {
      try {
        // Validate required fields
        const requiredFields = ['fullName', 'address', 'dateOfBirth', 'mobileNumber', 'prnNumber', 'rollNumber', 'yearOfJoining', 'courseName'];
        const missingFields = requiredFields.filter(field => !record[field]);
        
        if (missingFields.length > 0) {
          results.records.push({
            ...record,
            success: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          results.errors++;
          continue;
        }
        
        // Generate QR code
        const qrCodeData = `http://medical-college.edu/students/${record.prnNumber}`;
        const qrCodeFileName = `qr_${record.prnNumber}.png`;
        const qrCodePath = path.join('uploads', qrCodeFileName);
        
        // Calculate card validity (1 year from now)
        const cardValidity = new Date();
        cardValidity.setFullYear(cardValidity.getFullYear() + 1);
        
        // Create new student
        const student = new Student({
          photoUrl: record.photoUrl || null,
          fullName: record.fullName,
          address: record.address,
          dateOfBirth: new Date(record.dateOfBirth),
          mobileNumber: record.mobileNumber,
          prnNumber: record.prnNumber,
          rollNumber: record.rollNumber,
          yearOfJoining: parseInt(record.yearOfJoining),
          courseName: record.courseName,
          qrCode: `/uploads/${qrCodeFileName}`,
          cardValidity
        });
        
        // Generate and save QR code
        await QRCode.toFile(qrCodePath, qrCodeData);
        
        // Save student to database
        // await student.save();
        
        results.records.push({
          ...record,
          success: true
        });
        results.success++;
      } catch (error) {
        results.records.push({
          ...record,
          success: false,
          error: error.message
        });
        results.errors++;
      }
    }
    
    // Clean up the uploaded file
    fs.unlinkSync(filePath);
    
    res.json(results);
  } catch (error) {
    console.error('Error processing bulk upload:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard statistics
app.get('/api/students/stats', async (req, res) => {
  try {
    // In a real application, you would fetch actual statistics from the database
    // const totalStudents = await Student.countDocuments();
    // const newRegistrations = await Student.countDocuments({
    //   createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    // });
    
    // const courseDistribution = await Student.aggregate([
    //   { $group: { _id: '$courseName', count: { $sum: 1 } } },
    //   { $project: { course: '$_id', count: 1, _id: 0 } },
    //   { $sort: { count: -1 } }
    // ]);
    
    // const yearlyRegistration = await Student.aggregate([
    //   { $group: { _id: '$yearOfJoining', count: { $sum: 1 } } },
    //   { $project: { year: '$_id', count: 1, _id: 0 } },
    //   { $sort: { year: 1 } }
    // ]);
    
    // const recentStudents = await Student.find()
    //   .sort({ createdAt: -1 })
    //   .limit(5);
    
    // Mock statistics for demo
    const stats = {
      totalStudents: 152,
      totalCards: 145,
      newRegistrations: 8,
      courseCount: 5,
      courseDistribution: [
        { course: 'MBBS', count: 80 },
        { course: 'BDS', count: 35 },
        { course: 'BAMS', count: 20 },
        { course: 'BHMS', count: 12 },
        { course: 'Nursing', count: 5 }
      ],
      yearlyRegistration: [
        { year: 2021, count: 30 },
        { year: 2022, count: 42 },
        { year: 2023, count: 35 },
        { year: 2024, count: 45 },
        { year: 2025, count: 8 }
      ],
      recentStudents: [
        {
          _id: '1',
          fullName: 'John Smith',
          prnNumber: 'PRN2025001',
          courseName: 'MBBS',
          createdAt: new Date()
        },
        {
          _id: '2',
          fullName: 'Sarah Johnson',
          prnNumber: 'PRN2025002',
          courseName: 'BDS',
          createdAt: new Date(Date.now() - 86400000)
        },
        {
          _id: '3',
          fullName: 'Michael Williams',
          prnNumber: 'PRN2025003',
          courseName: 'BAMS',
          createdAt: new Date(Date.now() - 172800000)
        }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate QR code for a student
app.get('/api/students/:id/qr-code', async (req, res) => {
  try {
    // const student = await Student.findById(req.params.id);
    // if (!student) {
    //   return res.status(404).json({ error: 'Student not found' });
    // }
    
    // Generate QR code
    const qrCodeData = `http://medical-college.edu/students/${req.params.id}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
    
    res.type('png').send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Print multiple ID cards
app.post('/api/students/print', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty IDs array' });
    }
    
    // In a real application, you would fetch the students and generate a printable document
    // const students = await Student.find({ _id: { $in: ids } });
    
    // Mock response for demo
    res.json({
      message: `${ids.length} ID cards prepared for printing`,
      printJobId: `print-${Date.now()}`
    });
  } catch (error) {
    console.error('Error printing ID cards:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});