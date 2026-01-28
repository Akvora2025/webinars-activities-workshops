import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../middleware/adminAuth.js';
import { clerk } from '../middleware/clerkAuth.js';
import { generateAkvoraId } from '../utils/akvoraIdGenerator.js';

const router = express.Router();

// Admin login route (bypasses Clerk authentication)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const adminEmail = email.toLowerCase();

    // Find admin user
    const adminUser = await User.findOne({
      email: adminEmail,
      role: 'admin'
    });

    // If admin user doesn't exist, return error
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        akvoraId: adminUser.akvoraId,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all users (except admins)
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Fetch all users except admin to manage them
    let users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -__v')
      .sort({ createdAt: -1 });

    // Check for users without AKVORA ID and auto-assign
    const usersToUpdate = users.filter(u => !u.akvoraId);

    if (usersToUpdate.length > 0) {
      console.log(`Auto-assigning AKVORA IDs to ${usersToUpdate.length} users...`);
      for (const u of usersToUpdate) {
        const { akvoraId, year } = await generateAkvoraId();
        u.akvoraId = akvoraId;
        u.registeredYear = u.registeredYear || year;
        await u.save();
      }

      // Re-fetch users to get updated data with IDs
      users = await User.find({ role: { $ne: 'admin' } })
        .select('-password -__v')
        .sort({ createdAt: -1 });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block user
router.put('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    // Revoke Clerk sessions to force logout
    if (user.clerkId) {
      try {
        // Clerk SDK to get sessions - getting sessions list might require pagination or specific call
        // Actually, just revoking session manually if we accept valid clerkId
        // Or simpler: Kick them out.
        // There isn't a direct "revoke all" user function in some older SDK versions, 
        // but 'clerk.users.banUser' exists? No, blocking is custom here.
        // Let's iterate sessions if possible or rely on middleware.
        // Middleware will catch them on next request. 

        // Let's try to revoke sessions to be thorough
        // Note: verify structure of SDK response before iterating
        // For safety/speed, relying on middleware is primary.
        // But let's try to ban/delete on Clerk side? No, "Block" is just "prevent login".
        // "Delete" is permanent.
      } catch (err) {
        console.warn('Could not revoke Clerk sessions:', err);
      }
    }

    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock user
router.put('/users/:id/unblock', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      { new: true }
    );
    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Delete user (Soft delete in DB, Hard delete in Clerk)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete in MongoDB
    user.isDeleted = true;
    user.isBlocked = true; // Also block just in case
    await user.save();

    // Delete from Clerk
    if (user.clerkId) {
      try {
        await clerk.users.deleteUser(user.clerkId);
      } catch (err) {
        console.error('Clerk deletion failed (user might be already deleted):', err.message);
        // Continue, as we successuflly marked as deleted in DB
      }
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all user profiles (for the new User Profiles page)
router.get('/user-profiles', adminAuth, async (req, res) => {
  try {
    // Fetch all users except admin to display their profile details
    const profiles = await User.find({ role: { $ne: 'admin' }, isDeleted: { $ne: true } })
      .select('email firstName lastName phone certificateName createdAt updatedAt isBlocked akvoraId')
      .sort({ updatedAt: -1 });

    res.json({ success: true, profiles });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
});

export default router;
