import express from 'express';
import {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
} from '../controllers/videoController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public route - Get all videos
router.get('/', getAllVideos);

// Public route - Get single video
router.get('/:id', getVideoById);

// Admin routes - Protected
router.post('/', adminAuth, createVideo);
router.put('/:id', adminAuth, updateVideo);
router.delete('/:id', adminAuth, deleteVideo);

export default router;
