import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

// Multer setup for event image uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads', 'events');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});



// Admin routes (all require admin authentication)

// Create new event
router.post('/', verifyAdminToken, upload.single('eventImage'), async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.admin.userId
    };

    // Add image URL if image was uploaded
    if (req.file) {
      eventData.imageUrl = `/uploads/events/${req.file.filename}`;
    }

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get all events (admin view with full details)
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const events = await Event.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ date: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', verifyAdminToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Update event
router.put('/:id', verifyAdminToken, upload.single('eventImage'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if admin created this event
    if (event.createdBy.toString() !== req.admin.userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updateData = { ...req.body };

    // Add image URL if new image was uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/events/${req.file.filename}`;

      // Delete old image if it exists
      if (event.imageUrl && event.imageUrl.startsWith('/uploads/events/')) {
        const oldImagePath = path.join(__dirname, '..', event.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if admin created this event
    if (event.createdBy.toString() !== req.admin.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Register for event
router.post('/:eventId/register', async (req, res) => {
  try {
    const { userId, userEmail, userName } = req.body;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.participants.some(
      participant => participant.userId === userId
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Add user to participants
    event.participants.push({
      userId,
      email: userEmail,
      name: userName || 'User',
      registeredAt: new Date()
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      participantCount: event.participants.length
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Unregister from event
router.delete('/:eventId/unregister', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.userId !== userId
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from event',
      participantCount: event.participants.length
    });
  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
});

// Get event statistics
router.get('/stats/dashboard', verifyAdminToken, async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalParticipants: { $sum: '$currentParticipants' },
          upcoming: {
            $sum: {
              $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalEvents = await Event.countDocuments();
    const totalParticipants = await Event.aggregate([
      { $group: { _id: null, total: { $sum: '$currentParticipants' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalParticipants: totalParticipants[0]?.total || 0,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
