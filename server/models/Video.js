import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  embedUrl: {
    type: String,
    required: [true, 'YouTube embed URL is required'],
    trim: true,
    validate: {
      validator: function (url) {
        // Validate YouTube embed URL format (supports both youtube.com and youtube-nocookie.com)
        const youtubeEmbedRegex = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]+(\?.*)?$/;
        return youtubeEmbedRegex.test(url);
      },
      message: 'Please provide a valid YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID or https://www.youtube-nocookie.com/embed/VIDEO_ID)'
    }
  },
  createdBy: {
    type: String,
    required: true,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
videoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
