import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    endpoint: {
        type: String,
        required: true,
        unique: true
    },
    keys: {
        p256dh: {
            type: String,
            required: true
        },
        auth: {
            type: String,
            required: true
        }
    },
    userAgent: {
        type: String
    },
    deviceInfo: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient user lookup
pushSubscriptionSchema.index({ userId: 1, createdAt: -1 });

// Static method to get all subscriptions for a user
pushSubscriptionSchema.statics.getUserSubscriptions = function (userId) {
    return this.find({ userId });
};

// Static method to remove invalid subscription
pushSubscriptionSchema.statics.removeByEndpoint = function (endpoint) {
    return this.deleteOne({ endpoint });
};

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
