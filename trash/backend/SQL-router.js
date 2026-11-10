import express from 'express';
import Controller from './SQL-controller.js';

const router = express.Router();

router.get('/project', Controller);

export default router;