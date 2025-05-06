// server/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, default: 'Pending' },
  items:       [{ name: String, qty: Number }],
  estimatedTime: { type: Number }, // in minutes
  updatedAt:   { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
