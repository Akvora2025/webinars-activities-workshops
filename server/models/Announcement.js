import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active',
        index: true
    },
    createdBy: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    durationValue: {
        type: Number,
        required: true
    },
    durationUnit: {
        type: String,
        enum: ['hours', 'days'],
        required: true
    }
}, {
    timestamps: true
});

// Automatically update status based on expiry
// Automatically update status based on expiry
announcementSchema.pre('save', function () {
    if (this.expiresAt && new Date() > this.expiresAt) {
        this.status = 'expired';
    }
});

// Method to check if announcement is expired
announcementSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Static method to get active announcements
announcementSchema.statics.getActive = function () {
    return this.find({
        status: 'active',
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
