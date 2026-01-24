
const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = 'fallback-secret-key'; // Matching middleware default

async function testAnnouncementCreation() {
    try {
        // 1. Generate a valid admin token
        const token = jwt.sign(
            { role: 'admin', email: 'testadmin@akvora.com' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Generated Token:', token);

        // 2. Payload resembling the frontend request
        const payload = {
            title: 'Test Announcement',
            message: 'This is a test message from reproduction script',
            durationValue: 24,
            durationUnit: 'hours',
            link: 'https://example.com'
        };

        // 3. Make the request
        const response = await axios.post(`${API_URL}/announcements`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success:', response.status, response.data);

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Network/Script Error:', error.message);
        }
    }
}

testAnnouncementCreation();
