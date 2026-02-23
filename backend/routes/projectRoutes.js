import express from 'express';
import {
  createProject,
  getAllProjects,
  getProjects,
  getActiveProjects,
  getProjectById,
  updateProject,
  markProjectCompleted,
  deleteProject,
  assignDeveloperToProject,
  removeDeveloper,
  uploadProjectDocument,
  downloadProjectDocument,
  dashboardStats,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload, { handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private/Admin
 */
router.post('/', protect, authorize('Admin'), createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (role-based)
 * @access  Private
 */
router.get('/', protect, getProjects);

/**
 * @route   GET /api/projects/admin/all
 * @desc    Get all projects (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', protect, authorize('Admin'), getAllProjects);

/**
 * @route   GET /api/projects/active
 * @desc    Get all active projects
 * @access  Private
 */
router.get('/active', protect, getActiveProjects);

/**
 * @route   GET /api/projects/admin/dashboard-stats
 * @desc    Get dashboard statistics
 * @access  Private/Admin,Private/ProjectLead
 */
router.get('/admin/dashboard-stats', protect, authorize('Admin', 'ProjectLead'), dashboardStats);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', protect, getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private/Admin,Private/ProjectLead
 */
router.put('/:id', protect, authorize('Admin', 'ProjectLead'), updateProject);

/**
 * @route   PUT /api/projects/:id/complete
 * @desc    Mark a project as completed
 * @access  Private/Admin
 */
router.put('/:id/complete', protect, authorize('Admin'), markProjectCompleted);

/**
 * @route   PATCH /api/projects/:id/complete
 * @desc    Mark a project as completed (alias)
 * @access  Private/Admin
 */
router.patch('/:id/complete', protect, authorize('Admin'), markProjectCompleted);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('Admin'), deleteProject);

/**
 * @route   POST /api/projects/:id/assign
 * @desc    Assign a developer to a project
 * @access  Private/Admin,Private/ProjectLead
 */
router.post('/:id/assign', protect, authorize('Admin', 'ProjectLead'), assignDeveloperToProject);

/**
 * @route   POST /api/projects/:id/remove-developer
 * @desc    Remove a developer from a project
 * @access  Private/Admin,Private/ProjectLead
 */
router.post('/:id/remove-developer', protect, authorize('Admin', 'ProjectLead'), removeDeveloper);

/**
 * @route   POST /api/projects/:id/documents
 * @desc    Upload a document to a project
 * @access  Private/Admin,Private/ProjectLead
 */
router.post(
  '/:id/documents',
  protect,
  authorize('Admin', 'ProjectLead'),
  upload.single('document'),
  handleUploadError,
  uploadProjectDocument
);

/**
 * @route   GET /api/projects/:id/documents/:filename
 * @desc    Download a project document
 * @access  Private
 */
router.get('/:id/documents/:filename', protect, downloadProjectDocument);

export default router;
