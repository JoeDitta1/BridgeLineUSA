import express from 'express';
import quotesBomRoutes from './quotesBomRoutes.js';

const router = express.Router();

router.use('/quotes', quotesBomRoutes);

export default router;