import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Get all developers (Admin and ProjectLead only)
 * @route GET /api/users/developers
 * @access Private/Admin,Private/ProjectLead
 */
export const getDevelopers = async (req, res, next) => {
  try {
    console.log('=== FETCH DEVELOPERS ===');
    const developers = await User.find({ role: 'Developer' })
      .select('-password -mfaSecret')
      .sort({ name: 1 });

    console.log('Developers fetched:', developers.length);
    console.log('Developers:', developers.map(d => ({ id: d._id, name: d.name, email: d.email, role: d.role })));
    console.log('========================');

    res.status(200).json({
      success: true,
      count: developers.length,
      data: developers,
    });
  } catch (error) {
    console.error('Get developers error:', error);
    next(error);
  }
};

/**
 * Get all users (Admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -mfaSecret').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user (Admin only)
 * @route POST /api/users
 * @access Private/Admin
 */
export const createUser = async (req, res, next) => {
  console.time('createUser');
  try {
    const { name, email, password, role } = req.body;

    console.log('=== CREATE USER REQUEST ===');
    console.log('Body:', req.body);
    console.log('===========================');

    // Validate required fields
    if (!name || !email || !password) {
      console.timeEnd('createUser');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Validate role
    const validRoles = ['Admin', 'ProjectLead', 'Developer'];
    if (role && !validRoles.includes(role)) {
      console.timeEnd('createUser');
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.timeEnd('createUser');
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Developer',
    });

    console.timeEnd('createUser');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    console.timeEnd('createUser');
    next(error);
  }
};

/**
 * Update user (Admin only)
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    console.log('=== UPDATE USER REQUEST ===');
    console.log('userId from params:', id);
    console.log('Body:', req.body);
    console.log('===========================');

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid user ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // Validate role if provided
    const validRoles = ['Admin', 'ProjectLead', 'Developer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString() && user.role === 'Admin' && role && role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change your own admin role',
      });
    }

    // Prevent removing the last admin
    if (user.role === 'Admin' && role && role !== 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Cannot remove the last admin user',
        });
      }
    }

    // Update fields safely
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(error);
  }
};

/**
 * Delete user (Admin only)
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('=== DELETE USER REQUEST ===');
    console.log('userId from params:', id);
    console.log('===========================');

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid user ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete the last admin user',
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};
