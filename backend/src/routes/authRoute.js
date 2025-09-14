// backend/src/routes/authRoute.js
import express from 'express';
import { createClient } from '@supabase/supabase-js';

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

    res.json({
      success: true,
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
    if (!req.session.userId) {
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
export { requireAuth, requireRole };