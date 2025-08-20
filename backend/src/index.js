import express from 'express';
import cors from 'cors';
import quotesRouter from './routes/quotesRoute.js';
import materialsRouter from './routes/materialsRoute.js';
import { migrate } from './db.js';

const app = express();

// CORS that works with Codespaces
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Allow any GitHub Codespaces domain
    if (origin.includes('.app.github.dev')) {
      return callback(null, true);
    }
    
    // Allow localhost for local development
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

migrate();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/quotes', quotesRouter);
app.use('/api/materials', materialsRouter);

// IMPORTANT: Bind to 0.0.0.0, not localhost
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on :${PORT}`);
});