import express from 'express';
import {
  getDevelopers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/developers
 * @desc    Get all developers
 * @access  Private/Admin,Private/ProjectLead
 */
router.get('/developers', protect, authorize('Admin', 'ProjectLead'), getDevelopers);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', protect, authorize('Admin'), getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private/Admin
 */
router.post('/', protect, authorize('Admin'), createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user role
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('Admin'), updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('Admin'), deleteUser);

export default router;
