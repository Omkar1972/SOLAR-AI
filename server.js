const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const weatherRoutes = require('./routes/weather');
const solarRoutes = require('./routes/solar');
const userRoutes = require('./routes/users');
const predictionRoutes = require('./routes/predictions');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Solar AI Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/solar', solarRoutes);
app.use('/api/users', userRoutes);
app.use('/api/predictions', auth, predictionRoutes);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve solar calculator
app.get('/solar-calculator', (req, res) => {
    res.sendFile(__dirname + '/public/solar-calculator.html');
});

// Serve test location page
app.get('/test-location', (req, res) => {
    res.sendFile(__dirname + '/public/test-location.html');
});

// Serve all districts weather page
app.get('/all-districts-weather', (req, res) => {
    res.sendFile(__dirname + '/public/all-districts-weather.html');
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Solar AI Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
});

module.exports = app; 