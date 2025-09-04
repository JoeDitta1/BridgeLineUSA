import express from 'express';
import { json } from 'body-parser';
import { connectToDatabase } from './db';
import apiKeysController from './controllers/apiKeysController';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Database connection
connectToDatabase();

// Routes
app.use('/api/keys', apiKeysController);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});