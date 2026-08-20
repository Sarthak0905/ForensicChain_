const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// Create a new order for Premium Subscription / Storage upgrade
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_upgrade_1' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit (e.g. paise)
      currency,
      receipt: `re_${req.user.id.substring(0, 5)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID // Send to frontend for checkout initialization
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// Verify the payment signature from the frontend
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const investigatorId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details incomplete' });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed: Invalid signature' });
    }

    // Update user to premium/upgraded status
    await User.findByIdAndUpdate(investigatorId, { 
      role: 'premium_investigator' // Or whatever premium flag you have
    });

    res.json({
      success: true,
      message: 'Payment verified successfully. Account upgraded!',
      paymentId: razorpay_payment_id
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ error: 'Payment verification error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
