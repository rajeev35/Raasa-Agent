// // server/controllers/chatController.js
// import mongoose from 'mongoose';
// import Order    from '../models/Order.js';
// import OpenAI   from 'openai';

// export const handleChat = async (req, res) => {
//   // Debug log
//   console.log('Loaded OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);

//   const { message, userId: rawUserId } = req.body;

//   try {
//     if (!rawUserId) throw new Error('userId missing');
//     const userId = new mongoose.Types.ObjectId(rawUserId);

//     const text  = message.trim();
//     const lower = text.toLowerCase();

//     // Order intents
//     const match = lower.match(/order\s*(?:number\s*)?(\d+)/i);
//     if (match) {
//       const orderNumber = match[1];

//       // Cancel intent
//       if (/^cancel/i.test(lower)) {
//         const updated = await Order.findOneAndUpdate(
//           { orderNumber, userId },
//           { status: 'Cancelled', updatedAt: new Date() },
//           { new: true }
//         );
//         if (updated) {
//           return res.json({ reply: `Order *${orderNumber}* successfully *Cancelled*.` });
//         } else {
//           return res.json({ reply: `Order ${orderNumber} nahi mila ya aapka nahi hai.` });
//         }
//       }

//       // Status intent
//       const order = await Order.findOne({ orderNumber, userId });
//       if (order) {
//         return res.json({
//           reply: `Aapka order *${orderNumber}* abhi *${order.status}* hai. ETA: ${order.estimatedTime || 'N/A'} min.`
//         });
//       } else {
//         return res.json({ reply: `Order ${orderNumber} nahi mila ya match nahi karta.` });
//       }
//     }

//     // AI fallback in its own try/catch
//     try {
//       const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//       const resp = await openai.chat.completions.create({
//         model: 'gpt-3.5-turbo',
//         messages: [
//           { role: 'system', content: 'You are a helpful food-delivery assistant.' },
//           { role: 'user',   content: text }
//         ]
//       });
//       const aiReply = resp.choices[0].message.content;
//       return res.json({ reply: aiReply });
//     } catch (aiErr) {
//       console.error('OpenAI error:', aiErr.code || aiErr);
//       // Rate-limit or other AI errors ke liye fallback
//       return res.json({
//         reply: 'Sorry, AI service abhi available nahi hai. Aap order status ya cancel karne ke liye bolein, ya thodi der baad try karen.'
//       });
//     }

//   } catch (err) {
//     console.error('ChatController error:', err);
//     return res.status(500).json({
//       reply: 'Sorry, server error ho gaya. Thodi der baad try karo.'
//     });
//   }
// };
// server/controllers/chatController.js
import mongoose from 'mongoose';
import Order    from '../models/Order.js';
import OpenAI   from 'openai';

export const handleChat = async (req, res) => {
  console.log('Loaded OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);

  const { message, userId: rawUserId } = req.body;
  const timestamp = new Date().toLocaleTimeString();  // हर response के लिए

  try {
    if (!rawUserId) throw new Error('userId missing');
    const userId = new mongoose.Types.ObjectId(rawUserId);

    const text  = message.trim();
    const lower = text.toLowerCase();
    const match = lower.match(/order\s*(?:number\s*)?(\d+)/i);

    if (match) {
      const orderNumber = match[1];

      // Cancel intent
      if (/^cancel/i.test(lower)) {
        const updated = await Order.findOneAndUpdate(
          { orderNumber, userId },
          { status: 'Cancelled', updatedAt: new Date() },
          { new: true }
        );
        const reply = updated
          ? `Order *${orderNumber}* successfully *Cancelled*.`
          : `Order ${orderNumber} nahi mila ya aapka nahi hai.`;
        return res.json({ reply, timestamp });
      }

      // Status intent
      const order = await Order.findOne({ orderNumber, userId });
      if (order) {
        const reply = `Aapka order *${orderNumber}* abhi *${order.status}* hai. ETA: ${order.estimatedTime || 'N/A'} min.`;
        return res.json({ reply, timestamp });
      } else {
        const reply = `Order ${orderNumber} nahi mila ya match nahi karta.`;
        return res.json({ reply, timestamp });
      }
    }

    // AI fallback
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful food-delivery assistant.' },
          { role: 'user',   content: text }
        ]
      });
      const aiReply = resp.choices[0].message.content;
      return res.json({ reply: aiReply, timestamp });
    } catch (aiErr) {
      console.error('OpenAI error:', aiErr.code || aiErr);
      const reply = 'Sorry, AI service abhi available nahi hai. Aap order status ya cancel karne ke liye bolein, ya thodi der baad try karen.';
      return res.json({ reply, timestamp });
    }

  } catch (err) {
    console.error('ChatController error:', err);
    const reply = 'Sorry, server error ho gaya. Thodi der baad try karo.';
    return res.status(500).json({ reply, timestamp });
  }
};
