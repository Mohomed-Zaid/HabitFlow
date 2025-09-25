import type { Request, Response, NextFunction, Express } from "express";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";

// Session management
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
  sessionId?: string;
}

// Authentication middleware
export async function authenticateSession(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    req.sessionId = sessionId;
    req.userId = user.id; // Keep for compatibility
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// Optional authentication middleware (for public routes that can benefit from auth)
export async function optionalAuth(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                     req.cookies?.sessionId;

    if (sessionId) {
      const session = await storage.getSession(sessionId);
      if (session) {
        const user = await storage.getUser(session.userId);
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email
          };
          req.sessionId = sessionId;
          req.userId = user.id;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if optional auth fails
  }
}

// Authentication routes
export function registerAuthRoutes(app: Express) {
  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username) ||
                          await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ 
          error: 'User already exists with this username or email' 
        });
      }

      // Create user (password will be hashed in storage)
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password
      });

      // Create session (7 days)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const session = await storage.createSession(user.id, expiresAt);

      // Set session cookie
      res.cookie('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        sessionId: session.id
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      } else {
        res.status(500).json({ error: 'Failed to register user' });
      }
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by username
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Verify password
      const isValidPassword = await storage.verifyPassword(
        validatedData.password, 
        user.password
      );
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Update last login  
      const now = new Date();
      await storage.updateUser(user.id, {
        lastLoginAt: now
      });

      // Create session (7 days)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const session = await storage.createSession(user.id, expiresAt);

      // Set session cookie
      res.cookie('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          lastLoginAt: new Date()
        },
        sessionId: session.id
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors 
        });
      } else {
        res.status(500).json({ error: 'Failed to login' });
      }
    }
  });

  // User logout
  app.post("/api/auth/logout", authenticateSession, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.sessionId) {
        await storage.deleteSession(req.sessionId);
      }
      
      res.clearCookie('sessionId');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateSession, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  // Password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ 
          message: 'If an account with that email exists, a password reset link has been sent.' 
        });
      }

      // Create reset token (expires in 1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const resetToken = await storage.createPasswordResetToken(user.id, expiresAt);

      // In a real app, you'd send an email here
      // For demo purposes, we'll just log the token
      console.log(`Password reset token for ${email}: ${resetToken.token}`);

      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Remove this in production - only for demo
        resetToken: resetToken.token
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  });

  // Password reset
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Update user password
      await storage.updateUser(resetToken.userId, { password: newPassword });
      
      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Session cleanup (periodic)
  setInterval(async () => {
    try {
      const cleaned = await storage.cleanExpiredSessions();
      if (cleaned > 0) {
        console.log(`Cleaned ${cleaned} expired sessions`);
      }
    } catch (error) {
      console.error('Session cleanup error:', error);
    }
  }, 60 * 60 * 1000); // Run every hour
}

// Remove the global namespace declaration to avoid conflicts with routes.ts