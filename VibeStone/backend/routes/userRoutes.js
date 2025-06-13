import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, toggleVerification } from '../controllers/userController.js';

const router = express.Router();

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Toggle user verification status
router.put('/:id/toggle-verification', toggleVerification);

// Delete user
router.delete('/:id', deleteUser);

export default router; 