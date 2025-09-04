import express from 'express';
import { json } from 'body-parser';
import quotesRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use('/api', quotesRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});