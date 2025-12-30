import express from 'express';
import Event from '../models/Event.js';

const router = express.Router();

// Get all public events (visible to all users)
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const filter = { status: 'upcoming' }; // Only show upcoming events by default
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const events = await Event.find(filter)
      .select('-registeredUsers') // Exclude registered users for privacy
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single public event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('-registeredUsers')
      .populate('createdBy', 'firstName lastName');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get public event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get events by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['internship', 'workshop', 'webinar'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    const events = await Event.find({ 
      type, 
      status: 'upcoming' 
    })
      .select('-registeredUsers')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get events by type error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
