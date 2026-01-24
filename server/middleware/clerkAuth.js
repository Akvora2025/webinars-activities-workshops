import { createClerkClient } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Clerk client with secret key
const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY 
});

/**
 * Middleware to verify Clerk JWT token
 * The token from Clerk React SDK's getToken() is a session token
 */
export async function verifyClerkToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the session token with Clerk
      const sessionClaims = await clerk.verifyToken(token);
      
      // Extract user ID - Clerk tokens have 'sub' field containing user ID
      const userId = sessionClaims.sub || sessionClaims.userId || sessionClaims.id;
      
      if (!userId) {
        console.error('No user ID found in token claims:', sessionClaims);
        return res.status(401).json({ error: 'Invalid token: no user ID found' });
      }

      // Get user details from Clerk to ensure we have the correct user ID
      try {
        const clerkUser = await clerk.users.getUser(userId);
        req.clerkUser = clerkUser;
        req.clerkId = clerkUser.id;
        req.clerkEmail = clerkUser.emailAddresses?.[0]?.emailAddress || 
                        clerkUser.primaryEmailAddressId ? 
                        clerkUser.emailAddresses?.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress : 
                        null;
      } catch (userError) {
        // If we can't fetch user, use the ID from token
        console.warn('Could not fetch user from Clerk, using token ID:', userError.message);
        req.clerkUser = sessionClaims;
        req.clerkId = userId;
        req.clerkEmail = sessionClaims.email || null;
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

