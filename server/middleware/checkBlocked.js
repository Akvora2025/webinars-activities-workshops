/**
 * Middleware to check if user is blocked
 * Applied to protected routes that blocked users should NOT access
 */
export function checkBlocked(req, res, next) {
    if (req.isBlocked) {
        return res.status(403).json({
            error: 'Your account has been blocked by admin.',
            isBlocked: true // Frontend can use this to redirect to profile
        });
    }
    next();
}
