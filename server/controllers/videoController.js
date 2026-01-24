import Video from '../models/Video.js';

// Create a new video (Admin only)
export const createVideo = async (req, res) => {
    try {
        const { title, embedUrl } = req.body;

        // Validate required fields
        if (!title || !embedUrl) {
            return res.status(400).json({
                success: false,
                error: 'Title and YouTube embed URL are required'
            });
        }

        // Additional validation for YouTube embed URL (supports both youtube.com and youtube-nocookie.com)
        const youtubeEmbedRegex = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/;
        if (!youtubeEmbedRegex.test(embedUrl)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube embed URL. Please use the format: https://www.youtube.com/embed/VIDEO_ID or https://www.youtube-nocookie.com/embed/VIDEO_ID'
            });
        }

        // Create new video
        const video = new Video({
            title,
            embedUrl,
            createdBy: req.admin?.username || 'admin'
        });

        await video.save();

        res.status(201).json({
            success: true,
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload video'
        });
    }
};

// Get all videos (sorted by latest first)
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find()
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: videos.length,
            videos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch videos'
        });
    }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch video'
        });
    }
};

// Update video (Admin only)
export const updateVideo = async (req, res) => {
    try {
        const { title, embedUrl } = req.body;

        // Validate YouTube embed URL if provided (supports both youtube.com and youtube-nocookie.com)
        if (embedUrl) {
            const youtubeEmbedRegex = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/;
            if (!youtubeEmbedRegex.test(embedUrl)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid YouTube embed URL. Please use the format: https://www.youtube.com/embed/VIDEO_ID or https://www.youtube-nocookie.com/embed/VIDEO_ID'
                });
            }
        }

        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { title, embedUrl, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            video
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update video'
        });
    }
};

// Delete video (Admin only)
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);

        if (!video) {
            return res.status(404).json({
                success: false,
                error: 'Video not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Video deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete video'
        });
    }
};
