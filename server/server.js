// server/server.js
import dotenv from 'dotenv';
dotenv.config();   // 1. load env

import mongoose from 'mongoose';
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);
console.log('Loaded OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);

// 2. connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

import app from './app.js';

// 3. start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
