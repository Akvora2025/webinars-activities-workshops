import WorkshopRegistration from '../models/WorkshopRegistration.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

/**
 * Register for a workshop with UPI reference
 */
export async function registerForWorkshop(req, res) {
    try {
        const { clerkId } = req;
        const { workshopId, nameOnCertificate, upiReference } = req.body;

        if (!clerkId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!workshopId || !nameOnCertificate || !upiReference) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Find the user in our database
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({ error: 'User profile not found' });
        }

        // Find the workshop
        const workshop = await Event.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        // Check if already registered
        const existingRegistration = await WorkshopRegistration.findOne({
            user: user._id,
            workshop: workshopId
        });

        if (existingRegistration) {
            return res.status(400).json({ error: 'You have already registered for this workshop' });
        }

        // Check if UPI reference is already used (to prevent duplicate payments)
        const duplicateUPI = await WorkshopRegistration.findOne({ upiReference });
        if (duplicateUPI) {
            return res.status(400).json({ error: 'This UPI reference number has already been used' });
        }

        // Create new registration
        const registration = await WorkshopRegistration.create({
            user: user._id,
            workshop: workshopId,
            nameOnCertificate,
            upiReference,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully. Pending verification.',
            registration
        });
    } catch (error) {
        console.error('Workshop registration error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Duplicate registration or UPI reference' });
        }
        res.status(500).json({ error: 'Failed to submit registration' });
    }
}

/**
 * Get current user's registrations
 */
export async function getMyRegistrations(req, res) {
    try {
        const { clerkId } = req;
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const registrations = await WorkshopRegistration.find({ user: user._id })
            .populate('workshop', 'title date type status imageUrl price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            registrations
        });
    } catch (error) {
        console.error('Get my registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
}

/**
 * Get all registrations for a specific workshop (Admin)
 */
export async function getWorkshopRegistrations(req, res) {
    try {
        const { workshopId } = req.params;

        const registrations = await WorkshopRegistration.find({ workshop: workshopId })
            .populate('user', 'firstName lastName email akvoraId certificateName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            registrations
        });
    } catch (error) {
        console.error('Get workshop registrations error:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
}

/**
 * Update registration status (Admin)
 */
export async function updateRegistrationStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, adminMessage } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const registration = await WorkshopRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        registration.status = status;
        if (adminMessage !== undefined) {
            registration.adminMessage = adminMessage;
        }

        await registration.save();

        // If approved, optionally add to Event's participants list
        if (status === 'approved') {
            const event = await Event.findById(registration.workshop);
            const user = await User.findById(registration.user);

            if (event && user) {
                // Check if already in participants
                const isAlreadyParticipant = event.participants.some(
                    p => p.userId === user.clerkId
                );

                if (!isAlreadyParticipant) {
                    event.participants.push({
                        userId: user.clerkId,
                        email: user.email,
                        name: `${user.firstName} ${user.lastName}`,
                        registeredAt: new Date()
                    });
                    await event.save();
                }
            }
        }

        res.json({
            success: true,
            message: `Registration ${status} successfully`,
            registration
        });
    } catch (error) {
        console.error('Update registration status error:', error);
        res.status(500).json({ error: 'Failed to update registration status' });
    }
}
