import express from 'express';
import { getCloudinarySignature } from '../controllers/uploadController.js';

const uploadRouter = express.Router();

uploadRouter.post('/signature', getCloudinarySignature);

export default uploadRouter;