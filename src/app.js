const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const submitRouter = require('./routes/submit');
const statusRouter = require('./routes/status');
const resultRouter = require('./routes/result');

const app = express();

// CORS Configuration - Allow all origins for development
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with explicit config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/health', healthRouter);
app.use('/submit', submitRouter);
app.use('/status', statusRouter);
app.use('/result', resultRouter);

module.exports = app;

