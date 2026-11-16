import express from 'express';
import SQLRouter from './SQL-router.js';
import cor from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cor(
    {
        origin: '*',
    }
));

// Routes
app.use('/api/v1', SQLRouter);

// Test route
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

export default app;