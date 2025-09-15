// backend/src/routes/authRoute.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:');
  console.error('SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to load user profile' 
      });
    }

    // Store session info
    req.session.userId = authData.user.id;
    req.session.userEmail = authData.user.email;
    req.session.userRole = profile.role;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: authData.user.id,
        email: authData.user.email,
        role: profile.role
      },
      process.env.JWT_SECRET || 'dev-jwt-secret',
      { expiresIn: '24h' }
    );

    // Force session save
    req.session.save();

    res.json({
      success: true,
      token: token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
        company: profile.company,
        full_name: profile.full_name,
        is_active: profile.is_active
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Check authentication status
router.get('/check', async (req, res) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret');
        console.log('JWT auth check - decoded:', decoded);
        
        // Get current user profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', decoded.userId)
          .single();

        if (error) {
          console.log('Profile fetch error:', error);
          return res.json({ authenticated: false });
        }

        return res.json({
          authenticated: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            role: profile.role,
            company: profile.company,
            full_name: profile.full_name,
            is_active: profile.is_active
          }
        });
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
        return res.json({ authenticated: false });
      }
    }

    // Fallback to session-based auth
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - Session data:', {
      userId: req.session.userId,
      userEmail: req.session.userEmail,
      userRole: req.session.userRole
    });
    
    if (!req.session.userId) {
      console.log('Auth check - No userId in session');
      return res.json({ authenticated: false });
    }

    // Get current user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', req.session.userId)
      .single();

    if (error) {
      req.session.destroy();
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        role: profile.role,
        company: profile.company,
        full_name: profile.full_name,
        is_active: profile.is_active
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ authenticated: false });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Logout failed' 
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Middleware to check JWT authentication
const requireJWTAuth = async (req, res, next) => {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required - no JWT token provided' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-jwt-secret');
    
    // Get current user profile to ensure user still exists and is active
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', decoded.userId)
      .single();

    if (error || !profile) {
      console.log('JWT auth failed - user not found:', {
        userId: decoded.userId,
        error: error?.message
      });
      return res.status(401).json({ 
        error: 'Authentication failed - user not found' 
      });
    }

    console.log('JWT auth - user profile:', {
      userId: decoded.userId,
      email: decoded.email,
      role: profile.role,
      is_active: profile.is_active,
      full_name: profile.full_name
    });

    // Check if user is active (handle missing is_active column)
    const isActive = profile.is_active !== false; // Default to true if column doesn't exist
    const isAdmin = profile.role === 'admin' || decoded.email === 'johnjoseph.clark@atlascopco.com'; // TEMP: Allow this user admin access

    if (!isActive && !isAdmin) {
      console.log('JWT auth failed - user inactive and not admin:', {
        userId: decoded.userId,
        email: decoded.email,
        role: profile.role,
        is_active: profile.is_active
      });
      return res.status(401).json({ 
        error: 'Authentication failed - user account is inactive' 
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: profile.role,
      company: profile.company,
      full_name: profile.full_name,
      is_active: profile.is_active
    };

    next();
  } catch (jwtError) {
    console.log('JWT authentication failed:', jwtError.message);
    return res.status(401).json({ 
      error: 'Authentication failed - invalid JWT token' 
    });
  }
};

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }
  next();
};

// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    if (req.session.userRole !== role) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    
    next();
  };
};

export default router;
export { requireAuth, requireRole, requireJWTAuth };