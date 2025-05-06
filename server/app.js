// server/app.js
import express from 'express';
import cors    from 'cors';
import chatRoutes from './routes/chat.js';

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'UP' }));

export default app;
