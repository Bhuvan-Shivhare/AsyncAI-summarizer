const express = require('express');

const healthRouter = require('./routes/health');
const submitRouter = require('./routes/submit');
const statusRouter = require('./routes/status');
const resultRouter = require('./routes/result');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/submit', submitRouter);
app.use('/status', statusRouter);
app.use('/result', resultRouter);

module.exports = app;

