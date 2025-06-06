import express from 'express';
import { analyzeUser } from '../controllers/analyzeController.js';

const router = express.Router();

router.post('/analyze-user', analyzeUser);

export default router; 