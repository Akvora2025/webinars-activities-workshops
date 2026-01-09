import mongoose from 'mongoose';

const workshopRegistrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    nameOnCertificate: {
        type: String,
        required: true
    },
    upiReference: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[0-9]{10,18}$/, 'Invalid UPI reference number']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminMessage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure one registration per user per workshop
workshopRegistrationSchema.index({ user: 1, workshop: 1 }, { unique: true });

export default mongoose.model('WorkshopRegistration', workshopRegistrationSchema);
