import Project from '../models/Project.js';
import User from '../models/User.js';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import mongoose, { Types } from 'mongoose';

/**
 * Create a new project (Admin only)
 * @route POST /api/projects
 * @access Private/Admin
 */
export const createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, projectLead, assignedDevelopers } = req.body;

    // Debug log
    console.log('=== CREATE PROJECT REQUEST ===');
    console.log('projectLead received:', projectLead);
    console.log('projectLead type:', typeof projectLead);
    console.log('Full body:', req.body);
    console.log('==============================');

    // Validate required fields
    if (!name || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and deadline are required',
      });
    }

    // Validate projectLead is provided
    if (!projectLead) {
      return res.status(400).json({
        success: false,
        message: 'Project lead is required',
      });
    }

    // Validate projectLead is a valid ObjectId string
    if (typeof projectLead !== 'string' || !mongoose.Types.ObjectId.isValid(projectLead)) {
      console.error('Invalid projectLead format:', projectLead);
      return res.status(400).json({
        success: false,
        message: 'Valid project lead ID is required',
      });
    }

    // Convert to ObjectId
    const projectLeadId = new mongoose.Types.ObjectId(projectLead);

    // Validate projectLead exists and has correct role
    const leadUser = await User.findById(projectLeadId);
    if (!leadUser) {
      return res.status(404).json({
        success: false,
        message: 'Project lead user not found',
      });
    }

    if (!['Admin', 'ProjectLead'].includes(leadUser.role)) {
      return res.status(400).json({
        success: false,
        message: 'Project lead must be Admin or ProjectLead',
      });
    }

    // Validate assignedDevelopers if provided
    let validDevelopers = [];
    if (assignedDevelopers && Array.isArray(assignedDevelopers) && assignedDevelopers.length > 0) {
      // Validate all developer IDs are valid ObjectIds
      const invalidIds = assignedDevelopers.filter(
        (id) => typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        console.error('Invalid developer IDs:', invalidIds);
        return res.status(400).json({
          success: false,
          message: 'Invalid developer ID format',
        });
      }

      const developers = await User.find({ _id: { $in: assignedDevelopers } });
      if (developers.length !== assignedDevelopers.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more assigned developers not found',
        });
      }
      validDevelopers = developers.map((dev) => dev._id.toString());
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      deadline: new Date(deadline),
      projectLead: projectLeadId,
      assignedDevelopers: validDevelopers,
      status: 'Active',
    });

    // Populate and return
    const populatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    console.log('Project created successfully:', project._id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject,
    });
  } catch (error) {
    console.error('Create project error:', error);
    next(error);
  }
};

/**
 * Get all projects (Role-based access)
 * @route GET /api/projects
 * @access Private
 */
export const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'Admin') {
      // Admin sees all projects
      projects = await Project.find()
        .populate('projectLead', 'name email')
        .populate('assignedDevelopers', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'ProjectLead') {
      // ProjectLead sees only their projects
      projects = await Project.find({ projectLead: req.user._id })
        .populate('projectLead', 'name email')
        .populate('assignedDevelopers', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Developer') {
      // Developer sees only projects they're assigned to
      projects = await Project.find({ assignedDevelopers: req.user._id })
        .populate('projectLead', 'name email')
        .populate('assignedDevelopers', 'name email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Invalid role',
      });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects (Admin only - legacy)
 * @route GET /api/projects
 * @access Private/Admin
 */
export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active projects (All authenticated users)
 * @route GET /api/projects/active
 * @access Private
 */
export const getActiveProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ status: 'Active' })
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project by ID (All authenticated users)
 * @route GET /api/projects/:id
 * @access Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project (Admin or ProjectLead of the project)
 * @route PUT /api/projects/:id
 * @access Private/Admin,Private/ProjectLead
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, deadline, status, assignedDevelopers } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'Admin';
    const isProjectLead = project.projectLead.toString() === req.user._id.toString();

    if (!isAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You do not have permission to update this project',
      });
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (deadline) project.deadline = new Date(deadline);
    if (status && ['Active', 'Completed'].includes(status)) {
      project.status = status;
    }

    // Handle assigned developers
    if (assignedDevelopers !== undefined) {
      if (Array.isArray(assignedDevelopers) && assignedDevelopers.length > 0) {
        const developers = await User.find({ _id: { $in: assignedDevelopers } });
        if (developers.length !== assignedDevelopers.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more assigned developers not found',
          });
        }
        project.assignedDevelopers = assignedDevelopers;
      } else {
        project.assignedDevelopers = [];
      }
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark project as completed (Admin only)
 * @route PUT /api/projects/:id/complete
 * @access Private/Admin
 */
export const markProjectCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Project is already completed',
      });
    }

    project.status = 'Completed';
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Project marked as completed',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project (Admin only)
 * @route DELETE /api/projects/:id
 * @access Private/Admin
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign developer to project (Admin or ProjectLead)
 * @route POST /api/projects/:id/assign
 * @access Private/Admin,Private/ProjectLead
 */
export const assignDeveloperToProject = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const { developerId } = req.body;

    console.log('=== ASSIGN DEVELOPER REQUEST ===');
    console.log('projectId:', projectId);
    console.log('developerId:', developerId);
    console.log('user:', req.user);
    console.log('================================');

    if (!developerId) {
      return res.status(400).json({
        success: false,
        message: 'Developer ID is required',
      });
    }

    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    if (!developerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid developer ID format',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Admin OR ProjectLead of this project
    const isAdmin = req.user.role === 'Admin';
    const isProjectLead = project.projectLead.toString() === req.user._id.toString();

    if (!isAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You can only assign developers to your own projects',
      });
    }

    const developer = await User.findById(developerId);

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: 'Developer not found',
      });
    }

    if (developer.role !== 'Developer') {
      return res.status(400).json({
        success: false,
        message: 'User must have Developer role',
      });
    }

    // Check for duplicate assignment
    const alreadyAssigned = project.assignedDevelopers.some(
      (devId) => devId.toString() === developerId
    );

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Developer is already assigned to this project',
      });
    }

    project.assignedDevelopers.push(developerId);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Developer assigned successfully',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Assign developer error:', error);
    next(error);
  }
};

/**
 * Remove developer from project (Admin or ProjectLead)
 * @route POST /api/projects/:id/remove-developer
 * @access Private/Admin,Private/ProjectLead
 */
export const removeDeveloper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { developerId } = req.body;

    if (!developerId) {
      return res.status(400).json({
        success: false,
        message: 'Developer ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Admin OR ProjectLead of this project
    const isAdmin = req.user.role === 'Admin';
    const isProjectLead = project.projectLead.toString() === req.user._id.toString();

    if (!isAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You do not have permission to modify this project',
      });
    }

    // Remove developer from assignedDevelopers array
    project.assignedDevelopers = project.assignedDevelopers.filter(
      (dev) => dev.toString() !== developerId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Developer removed successfully',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Remove developer error:', error);
    next(error);
  }
};

/**
 * Upload document to project (Admin or ProjectLead)
 * @route POST /api/projects/:id/documents
 * @access Private/Admin,Private/ProjectLead
 */
export const uploadProjectDocument = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    console.log('=== UPLOAD DOCUMENT REQUEST ===');
    console.log('projectId:', projectId);
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('================================');

    // Validate project ID format
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF or DOCX file.',
      });
    }

    // Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Admin OR ProjectLead of this project
    const isAdmin = req.user.role === 'Admin';
    const isProjectLead = project.projectLead.toString() === req.user._id.toString();

    if (!isAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Only Admin or Project Lead can upload documents',
      });
    }

    // Add document to project
    project.documents.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadDate: new Date(),
    });

    await project.save();

    console.log('Document saved to project:', project._id);

    // Return updated project
    const updatedProject = await Project.findById(project._id)
      .populate('projectLead', 'name email')
      .populate('assignedDevelopers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    next(error);
  }
};

/**
 * Download project document
 * @route GET /api/projects/:id/documents/:filename
 * @access Private
 */
export const downloadProjectDocument = async (req, res, next) => {
  try {
    const { id: projectId, filename } = req.params;

    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const document = project.documents.find((doc) => doc.filename === filename);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    const isAdmin = req.user.role === 'Admin';
    const isProjectLead = project.projectLead.toString() === req.user._id.toString();
    const isAssignedDeveloper = project.assignedDevelopers.some(
      (devId) => devId.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isProjectLead && !isAssignedDeveloper) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - You do not have access to this document',
      });
    }

    const filePath = join(__dirname, '..', 'uploads', filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics (Admin only)
 * @route GET /api/projects/admin/dashboard-stats
 * @access Private/Admin
 */
export const dashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        activeProjects,
        completedProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
