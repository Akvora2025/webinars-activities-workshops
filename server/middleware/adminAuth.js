import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin role required.' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};
