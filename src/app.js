const express = require('express');

const healthRouter = require('./routes/health');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);

module.exports = app;

