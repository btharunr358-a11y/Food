// orderController.js - Complete fixed version
import Order from '../models/orderModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
    try {
        console.log('Creating Razorpay order with data:', req.body);
        
        const { amount, currency = 'INR' } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount), // amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        console.log('Razorpay options:', options);

        const order = await razorpay.orders.create(options);
        
        console.log('Razorpay order created:', order);

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Razorpay order',
            error: error.message
        });
    }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (req, res) => {
  try {
    console.log("=== PAYMENT VERIFICATION START ===");
    console.log("Payment verification request body:", JSON.stringify(req.body, null, 2));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      address,
      items,
      amount,
    } = req.body;

    // Detailed validation with specific error messages
    if (!razorpay_order_id) {
      console.log("❌ Missing razorpay_order_id");
      return res.status(400).json({
        success: false,
        message: "Missing razorpay_order_id",
      });
    }

    if (!razorpay_payment_id) {
      console.log("❌ Missing razorpay_payment_id");
      return res.status(400).json({
        success: false,
        message: "Missing razorpay_payment_id",
      });
    }

    if (!razorpay_signature) {
      console.log("❌ Missing razorpay_signature");
      return res.status(400).json({
        success: false,
        message: "Missing razorpay_signature",
      });
    }

    if (!userId) {
      console.log("❌ Missing userId");
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    if (!address) {
      console.log("❌ Missing address");
      return res.status(400).json({
        success: false,
        message: "Missing address",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("❌ Missing or invalid items");
      return res.status(400).json({
        success: false,
        message: "Missing or invalid items",
      });
    }

    if (!amount || amount === 0) {
      console.log("❌ Missing or invalid amount");
      return res.status(400).json({
        success: false,
        message: "Missing or invalid amount",
      });
    }

    console.log("✅ All required fields present");

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("Signature verification:", {
      received: razorpay_signature,
      expected: expectedSign,
      match: razorpay_signature === expectedSign
    });

    if (razorpay_signature !== expectedSign) {
      console.log("❌ Signature mismatch");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("✅ Signature verified successfully");

    // Transform items to ensure they have required fields
    const transformedItems = items.map(item => ({
      name: item.name || 'Unknown Item',
      price: item.price || 0,
      quantity: item.quantity || 1,
      image: item.image || '',
      _id: item._id || `temp_${Date.now()}_${Math.random()}`
    }));

    // Save order
    const newOrder = new Order({
      userId,
      address,
      items: transformedItems,
      amount,
      paymentMethod: "razorpay",
      payment: true,
      status: "Food Processing",
      razorpay_order_id,
      razorpay_payment_id,
    });

    console.log("Saving order to database...");
    const savedOrder = await newOrder.save();
    console.log("✅ Order saved successfully:", savedOrder._id);

    res.json({
      success: true,
      message: "Payment verified and order saved successfully",
      order: savedOrder,
    });

    console.log("=== PAYMENT VERIFICATION COMPLETE ===");
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// Place COD order - UPDATED to use authenticated user
export const placeOrderCod = async (req, res) => {
    try {
        const { address, items, amount, paymentMethod } = req.body;
        const userId = req.userId; // From auth middleware

        // Validate required fields
        if (!address || !items || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: address, items, amount'
            });
        }

        // Create new order
        const newOrder = new Order({
            userId: userId, // Use authenticated user's ID
            address,
            items,
            amount,
            paymentMethod: paymentMethod || 'cod',
            status: 'Food Processing',
            payment: paymentMethod === 'cod' ? false : true
        });

        const savedOrder = await newOrder.save();

        res.json({
            success: true,
            message: 'Order placed successfully',
            order: savedOrder
        });
    } catch (error) {
        console.error('COD order placement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to place order',
            error: error.message
        });
    }
};

// Get user orders - FIXED VERSION
export const userOrders = async (req, res) => {
    try {
        // Get userId from authenticated user (set by auth middleware)
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required. Please ensure you are authenticated.'
            });
        }

        console.log('Fetching orders for user:', userId);

        const orders = await Order.find({ userId }).sort({ date: -1 });

        console.log('Found orders:', orders.length);

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// Verify order
export const verifyOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Verify order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify order',
            error: error.message
        });
    }
};

// List all orders (admin)
export const listOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('List orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

// Get restaurant orders
export const getRestaurantOrders = async (req, res) => {
    try {
        const { restaurantId } = req.query;

        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required'
            });
        }

        const orders = await Order.find({
            'items.restaurantId': restaurantId
        }).sort({ date: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get restaurant orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch restaurant orders',
            error: error.message
        });
    }
};

// Update order status
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and status are required'
            });
        }

        const validStatuses = ['Food Processing', 'Out for delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};