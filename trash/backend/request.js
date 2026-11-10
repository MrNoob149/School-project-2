import express from 'express';
import SQLRouter from './SQL-router.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1', SQLRouter);

// Test route
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

export default app;