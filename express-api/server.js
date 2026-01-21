const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { connectToDatabase } = require('./db');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51O...[PLACEHOLDER]...';
console.log('Stripe Secret Key loaded (prefix):', STRIPE_SECRET_KEY.substring(0, 10));
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const emailjs = require('@emailjs/nodejs');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// EmailJS Configuration
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Email Service using EmailJS
const sendEmail = async (to, subject, htmlBody) => {
  try {
    // If EmailJS is not configured, fall back to console logging
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.log('--------------------------------------------------');
      console.log('EmailJS NOT CONFIGURED - Using Mock Mode');
      console.log(`MOCK EMAIL SENT TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY (HTML Preview): ${htmlBody.substring(0, 100)}...`);
      console.log('--------------------------------------------------');
      return { success: true, mock: true };
    }

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: to,
        subject: subject,
        message_html: htmlBody,
        to_name: to.split('@')[0], // Extract name from email
      },
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log(`✅ Email sent successfully to ${to} via EmailJS`);
    return { success: true, response };
    
  } catch (error) {
    // EmailJS errors often contain a .text property with the actual error message
    const errorMsg = error.text || error.message || 'Unknown error';
    console.error('❌ Error sending email via EmailJS:', errorMsg);
    if (error.stack) console.error(error.stack);
    throw error;
  }
};

const generateOrderEmail = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.bikeName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.subtotal.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Order Invoice & Confirmation</h1>
        <p style="margin: 5px 0 0;">#${order.orderNumber}</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Hi there,</p>
        <p>Thank you for your purchase via MotruBi. Your order has been received and is being processed.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: left;">Qty</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 10px;">$${order.subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; color: #666;">Tax:</td>
              <td style="padding: 10px; color: #666;">$${order.tax.toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; color: #666;">Shipping:</td>
              <td style="padding: 10px; color: #666;">$${order.shipping.toLocaleString()}</td>
            </tr>
            ${order.discount > 0 ? `
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; color: #10b981;">Discount:</td>
              <td style="padding: 10px; color: #10b981;">-$${order.discount.toLocaleString()}</td>
            </tr>` : ''}
            <tr>
              <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.2em;">Total:</td>
              <td style="padding: 10px; font-weight: bold; font-size: 1.2em;">$${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <h3 style="margin-top: 0;">Shipping to:</h3>
          <p style="margin-bottom: 0;">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}
          </p>
        </div>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          Detailed tracking information will be sent in a separate email when your item ships.
        </p>
      </div>
    </div>
  `;
};

// Generate Order Status Update Email
const generateStatusUpdateEmail = (order, newStatus) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and will be processed soon.',
    processing: 'Your order is now being processed and prepared for shipment.',
    shipped: 'Great news! Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been successfully delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled. If you have any questions, please contact support.'
  };

  const statusColors = {
    confirmed: '#3b82f6',
    processing: '#f59e0b',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444'
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">Order Status Update</h1>
        <p style="margin: 5px 0 0;">Order #${order.orderNumber}</p>
      </div>
      
      <div style="padding: 20px;">
        <div style="background-color: ${statusColors[newStatus] || '#3b82f6'}; color: white; padding: 15px; border-radius: 6px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; text-transform: uppercase;">${newStatus}</h2>
        </div>
        
        <p style="font-size: 16px; color: #333;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> $${order.total.toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Items:</strong> ${order.items?.length || 0} item(s)</p>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          Thank you for choosing MotruBi. If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    </div>
  `;
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'MotruBi API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      bikes: {
        getAll: 'GET /api/bikes',
        getOne: 'GET /api/bikes/:id',
        create: 'POST /api/bikes',
        update: 'PUT /api/bikes/:id',
        delete: 'DELETE /api/bikes/:id'
      },
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    }
  });
});

// Get all bikes
app.get('/api/bikes', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { category, featured, minPrice, maxPrice, search, onSale, inStock } = req.query;
    
    // Build MongoDB query
    let query = {};
    
    if (category && category !== 'all') {
      query.category = new RegExp(`^${category}$`, 'i');
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    if (onSale === 'true') {
      query.price = { $lt: 10000 };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }
    
    if (minPrice || maxPrice) {
      query.price = query.price || {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    const sortParam = req.query.sort || 'featured';
    
    // Determine sort order
    let sortOrder = {};
    switch (sortParam) {
      case 'price-asc':
        sortOrder = { price: 1, _id: 1 };
        break;
      case 'price-desc':
        sortOrder = { price: -1, _id: -1 };
        break;
      case 'newest':
        // Use _id for newest (MongoDB ObjectId contains timestamp)
        sortOrder = { _id: -1 };
        break;
      case 'featured':
      default:
        // Sort by featured if it exists, otherwise by _id
        sortOrder = { featured: -1, _id: -1 };
    }

    const totalBikes = await db.collection('bikes').countDocuments(query);
    const bikes = await db.collection('bikes').find(query).sort(sortOrder).skip(skip).limit(limit).toArray();
    
    res.json({
      success: true,
      count: bikes.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBikes / limit),
        totalBikes,
        hasNextPage: page * limit < totalBikes,
        hasPrevPage: page > 1
      },
      bikes: bikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bikes',
      error: error.message
    });
  }
});

// ============================================
// BIKES ROUTE
// ============================================

// Get user's created bikes (inventory) - THIS MUST BE BEFORE /:id
app.get('/api/bikes/my-inventory', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: userEmail });
    
    // Admins can see all bikes, others see only their created bikes
    let myBikes;
    if (user?.role === 'admin') {
      myBikes = await db.collection('bikes').find({}).toArray();
    } else {
      myBikes = await db.collection('bikes').find({ createdBy: userEmail }).toArray();
    }
    
    res.json({
      success: true,
      count: myBikes.length,
      bikes: myBikes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
});

// Get single bike by ID
app.get('/api/bikes/:id', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const bike = await db.collection('bikes').findOne({ id: req.params.id });
    
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    res.json({
      success: true,
      bike: bike
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bike',
      error: error.message
    });
  }
});

// Create new bike
app.post('/api/bikes', async (req, res) => {
  try {
    const { name, category, price, description, image, stock, engine, power, topSpeed, weight, features, colors } = req.body;
    const creatorEmail = req.headers.authorization?.replace('Bearer ', '');
    const db = await connectToDatabase();
    
    // Authorization: Only admin, merchandiser, and dealer can create bikes
    const user = await db.collection('users').findOne({ email: creatorEmail.toLowerCase() });
    const allowedRoles = ['admin', 'merchandiser', 'dealer'];
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized role' });
    }

    // Validation
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, price, description'
      });
    }
    
    // Generate new ID (find max ID and increment)
    const lastBike = await db.collection('bikes').find().sort({ id: -1 }).limit(1).toArray();
    let nextId = 1;
    if (lastBike.length > 0) {
      // Handle potential non-numeric IDs if they exist, but here we expect numeric strings
      nextId = parseInt(lastBike[0].id) + 1;
    }
    const newId = nextId.toString();
    
    // Create new bike object
    const newBike = {
      id: newId,
      name,
      category,
      price: parseFloat(price),
      description,
      image: image || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80',
      stock: parseInt(stock) || 0,
      rating: 0,
      engine: engine || 'N/A',
      power: power || 'N/A',
      topSpeed: topSpeed || 'N/A',
      weight: weight || 'N/A',
      features: features || [],
      colors: colors || ['Black'],
      featured: false,
      createdBy: creatorEmail
    };
    
    // Save to MongoDB
    await db.collection('bikes').insertOne(newBike);
    
    res.status(201).json({
      success: true,
      message: 'Bike created successfully',
      bike: newBike
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating bike',
      error: error.message
    });
  }
});

// Update bike
app.put('/api/bikes/:id', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const db = await connectToDatabase();
    
    const bike = await db.collection('bikes').findOne({ id: req.params.id });
    
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check permissions: only creator or admin can update
    const user = await db.collection('users').findOne({ email: userEmail });
    const isCreator = bike.createdBy === userEmail;
    const isAdmin = user?.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this bike'
      });
    }
    
    // Update bike with new data
    const updatedBike = {
      ...bike,
      ...req.body,
      id: req.params.id // Preserve original ID
    };
    
    await db.collection('bikes').updateOne(
      { id: req.params.id },
      { $set: updatedBike }
    );
    
    res.json({
      success: true,
      message: 'Bike updated successfully',
      bike: updatedBike
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating bike',
      error: error.message
    });
  }
});

// Delete bike
app.delete('/api/bikes/:id', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const db = await connectToDatabase();
    
    const bike = await db.collection('bikes').findOne({ id: req.params.id });
    
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check permissions: only creator or admin can delete
    const user = await db.collection('users').findOne({ email: userEmail });
    const isCreator = bike.createdBy === userEmail;
    const isAdmin = user?.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this bike'
      });
    }
    
    // Delete bike from MongoDB
    await db.collection('bikes').deleteOne({ id: req.params.id });
    
    res.json({
      success: true,
      message: 'Bike deleted successfully',
      bike: bike
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bike',
      error: error.message
    });
  }
});

// ============================================
// PRICING ROUTE
// ============================================

// Get price for a bike based on role and quantity
app.get('/api/pricing/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const { quantity } = req.query;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    // Connect to DB
    const db = await connectToDatabase();
    
    // Find the bike
    const bike = await db.collection('bikes').findOne({ id: bikeId });
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    let userRole = 'customer';
    
    // Get user role if authenticated
    if (userEmail) {
      const user = await db.collection('users').findOne({ email: userEmail });
      if (user) {
        userRole = user.role;
      }
    }

    const qty = parseInt(quantity) || 1;
    const basePrice = bike.price;
    let finalPrice = basePrice;
    let discount = 0;
    let discountPercent = 0;
    let tier = null;

    // Apply dealer pricing tiers
    if (userRole === 'dealer') {
      const user = await db.collection('users').findOne({ email: userEmail });
      if (user && user.isVerified) {
        if (qty >= 21) {
          discountPercent = 25;
          tier = 'Tier 4 (21+ units)';
        } else if (qty >= 11) {
          discountPercent = 20;
          tier = 'Tier 3 (11-20 units)';
        } else if (qty >= 6) {
          discountPercent = 15;
          tier = 'Tier 2 (6-10 units)';
        } else if (qty >= 1) {
          discountPercent = 10;
          tier = 'Tier 1 (1-5 units)';
        }

        discount = basePrice * (discountPercent / 100);
        finalPrice = basePrice - discount;
      } else {
        tier = 'Pending Verification';
      }
    }

    res.json({
      success: true,
      pricing: {
        bikeId,
        bikeName: bike.name,
        quantity: qty,
        userRole,
        basePrice,
        discountPercent,
        discount,
        unitPrice: finalPrice,
        totalPrice: finalPrice * qty,
        tier,
        savings: discount * qty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating price',
      error: error.message
    });
  }
});

// ============================================
// AUTH ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    const allowedRoles = ['customer', 'dealer', 'merchandiser', 'admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'customer';
    
    const db = await connectToDatabase();
    
    // Check if email already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Generate new ID
    const usersCount = await db.collection('users').countDocuments();
    
    // Create new user
    const newUser = {
      id: (usersCount + 1).toString(),
      name,
      email: email.toLowerCase(),
      password, // In production, hash this!
      role: userRole,
      isVerified: userRole === 'customer' ? true : false, // Customers are verified by default, others need approval
      createdAt: new Date().toISOString()
    };
    
    // Save to MongoDB
    await db.collection('users').insertOne(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const db = await connectToDatabase();
    
    // Find user
    const user = await db.collection('users').findOne({
      email: email.toLowerCase(),
      password: password
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Submit Dealer Verification
app.post('/api/dealer/verify', async (req, res) => {
  try {
    const { businessName, taxId, address, phone } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: userEmail.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'dealer') {
      return res.status(400).json({ success: false, message: 'Only dealers can submit verification' });
    }

    // Update user with verification data
    await db.collection('users').updateOne(
      { email: userEmail.toLowerCase() },
      {
        $set: {
          dealerInfo: {
            businessName,
            taxId,
            address,
            phone,
            submittedAt: new Date().toISOString()
          },
          verificationStatus: 'pending'
        }
      }
    );

    res.json({
      success: true,
      message: 'Verification details submitted successfully. Our team will review them soon.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting verification', error: error.message });
  }
});

// Admin Review Dealer (Mock)
app.post('/api/admin/verify-dealer', async (req, res) => {
  try {
    const { email, status } = req.body; // status: 'verified' or 'rejected'
    
    const db = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          isVerified: status === 'verified',
          verificationStatus: status
        }
      }
    );

    res.json({
      success: true,
      message: `Dealer status updated to ${status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating dealer status', error: error.message });
  }
});

// Update dealer info
app.put('/api/dealer/info', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    const { businessName, taxId, address, phone } = req.body;

    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();
    
    const user = await db.collection('users').findOne({ email: userEmail });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          dealerInfo: {
            businessName,
            taxId,
            address,
            phone,
            updatedAt: new Date().toISOString()
          }
        }
      }
    );
    res.json({ success: true, message: 'Dealer information updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating dealer info' });
  }
});

// Get dealer billing statements
app.get('/api/dealer/statements', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    // Verify user is a dealer
    const user = await db.collection('users').findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role !== 'dealer') {
      return res.status(403).json({ success: false, message: 'Only dealers can access billing statements' });
    }

    // Fetch all orders for this dealer
    const orders = await db.collection('orders').find({ userEmail }).sort({ createdAt: -1 }).toArray();
    
    if (orders.length === 0) {
      return res.json({ success: true, statements: [] });
    }

    // Group orders by month
    const statementsByMonth = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!statementsByMonth[monthKey]) {
        statementsByMonth[monthKey] = {
          month: monthKey,
          monthName: orderDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          orders: [],
          totalAmount: 0,
          orderCount: 0,
          totalSavings: 0
        };
      }
      
      statementsByMonth[monthKey].orders.push({
        orderNumber: order.orderNumber,
        date: order.createdAt,
        total: order.total,
        discount: order.discount || 0,
        itemCount: order.items?.length || 0
      });
      
      statementsByMonth[monthKey].totalAmount += order.total;
      statementsByMonth[monthKey].totalSavings += (order.discount || 0);
      statementsByMonth[monthKey].orderCount++;
    });

    // Convert to array and calculate due dates (NET-30 terms)
    const statements = Object.values(statementsByMonth).map(statement => {
      const [year, month] = statement.month.split('-');
      // Due date is last day of following month
      const dueDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month after order month
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        ...statement,
        dueDate: dueDate.toISOString().split('T')[0],
        daysUntilDue: daysUntilDue > 0 ? daysUntilDue : 0,
        isPastDue: daysUntilDue < 0
      };
    });

    // Sort by month (newest first)
    statements.sort((a, b) => b.month.localeCompare(a.month));

    res.json({
      success: true,
      statements,
      totalStatements: statements.length
    });
  } catch (error) {
    console.error('Error fetching dealer statements:', error);
    res.status(500).json({ success: false, message: 'Error fetching billing statements', error: error.message });
  }
});

// Addresses
app.get('/api/user/addresses', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();
    
    const userAddresses = await db.collection('addresses').find({ userEmail }).toArray();
    res.json({ success: true, addresses: userAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses' });
  }
});

app.post('/api/user/addresses', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();

    const newAddress = {
      ...req.body,
      id: Date.now().toString(),
      userEmail,
      createdAt: new Date().toISOString()
    };

    await db.collection('addresses').insertOne(newAddress);
    res.json({ success: true, address: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding address' });
  }
});

app.delete('/api/user/addresses/:id', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();

    await db.collection('addresses').deleteOne({ id: req.params.id, userEmail });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting address' });
  }
});

// User reviews
app.get('/api/user/reviews', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();

    const userReviews = await db.collection('reviews').find({ userEmail }).toArray();
    
    const reviewsWithBikes = await Promise.all(
      userReviews.map(async (r) => {
        const bike = await db.collection('bikes').findOne({ id: r.bikeId });
        return { ...r, bikeName: bike?.name || 'Unknown Bike' };
      })
    );

    res.json({ success: true, reviews: reviewsWithBikes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Admin Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const db = await connectToDatabase();
    
    // Get all users without passwords
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const authEmail = req.headers.authorization?.replace('Bearer ', '');

    if (!authEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone; // Store phone in root or dealerInfo depending on structure, usually root for general profile
    if (password) updateData.password = password; // In a real app, hash this!

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    const result = await db.collection('users').updateOne(
      { email: authEmail },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Change user role
app.post('/api/admin/users/role', async (req, res) => {
  try {
    const { email, role } = req.body;
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    
    const db = await connectToDatabase();
    
    const adminUser = await db.collection('users').findOne({ email: adminEmail });
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await db.collection('users').updateOne(
      { email: email.toLowerCase() },
      { $set: { role } }
    );

    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
});

// Get platform settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const db = await connectToDatabase();
    
    const adminUser = await db.collection('users').findOne({ email: adminEmail });
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Get or initialize settings
    let settings = await db.collection('settings').findOne({ _id: 'app_settings' });
    
    if (!settings) {
      settings = {
        _id: 'app_settings',
        maintenanceMode: false,
        dealerAutoApproval: false
      };
      await db.collection('settings').insertOne(settings);
    }

    res.json({ success: true, settings: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings', error: error.message });
  }
});

// Update platform settings
app.put('/api/admin/settings', async (req, res) => {
  try {
    const { maintenanceMode, dealerAutoApproval } = req.body;
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const db = await connectToDatabase();
    
    const adminUser = await db.collection('users').findOne({ email: adminEmail });
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Update settings
    const updateFields = {};
    if (maintenanceMode !== undefined) updateFields.maintenanceMode = maintenanceMode;
    if (dealerAutoApproval !== undefined) updateFields.dealerAutoApproval = dealerAutoApproval;

    await db.collection('settings').updateOne(
      { _id: 'app_settings' },
      { $set: updateFields },
      { upsert: true }
    );

    const settings = await db.collection('settings').findOne({ _id: 'app_settings' });

    res.json({ success: true, settings: settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const db = await connectToDatabase();
    
    const adminUser = await db.collection('users').findOne({ email: adminEmail });
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'merchandiser')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const orders = await db.collection('orders').find({}).toArray();
    const users = await db.collection('users').find({}).toArray();
    const bikes = await db.collection('bikes').find({}).toArray();

    // Map bikes and categories
    const bikeCategoryMap = bikes.reduce((acc, b) => {
      acc[b.id] = b.category;
      return acc;
    }, {});

    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalBikes = bikes.length;
    const totalInventory = bikes.reduce((sum, b) => sum + b.stock, 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Detailed Revenue Analytics
    const salesByDay = {};
    const salesByMonth = {};
    const revenueByCategory = {};
    const productSales = {};

    orders.forEach(o => {
      const date = o.createdAt.split('T')[0];
      const month = date.substring(0, 7); // YYYY-MM
      
      // Daily Sales
      salesByDay[date] = (salesByDay[date] || 0) + o.total;
      
      // Monthly Sales
      salesByMonth[month] = (salesByMonth[month] || 0) + o.total;

      // Item level analysis
      o.items.forEach(item => {
        const category = bikeCategoryMap[item.bikeId] || 'Unknown';
        revenueByCategory[category] = (revenueByCategory[category] || 0) + (item.subtotal || 0);

        // Track product popularity
        if (!productSales[item.bikeId]) {
          productSales[item.bikeId] = {
            name: item.bikeName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.bikeId].quantity += item.quantity;
        productSales[item.bikeId].revenue += (item.subtotal || 0);
      });
    });

    // Get Top 5 Products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalUsers,
        totalBikes,
        totalInventory,
        averageOrderValue,
        salesByDay,
        salesByMonth,
        revenueByCategory,
        topProducts
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// Bulk Upload Bikes
app.post('/api/bikes/bulk', async (req, res) => {
  try {
    const bikes = req.body; // Expecting an array
    if (!Array.isArray(bikes)) return res.status(400).json({ success: false, message: 'Expected an array of bikes' });

    const db = await connectToDatabase();
    
    const allBikes = await db.collection('bikes').find({}).toArray();
    let maxId = allBikes.length > 0 ? Math.max(...allBikes.map(b => parseInt(b.id))) : 0;

    const newBikes = bikes.map(b => {
      maxId++;
      return {
        ...b,
        id: maxId.toString(),
        rating: b.rating || 0,
        stock: b.stock || 0,
        featured: b.featured || false
      };
    });

    await db.collection('bikes').insertMany(newBikes);

    res.json({ success: true, message: `Successfully uploaded ${newBikes.length} bikes` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in bulk upload' });
  }
});

// ============================================
// CART ROUTES
// ============================================

// Get user's cart
app.get('/api/cart', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    // Get user's cart items
    const userCartItems = await db.collection('cart').find({ userEmail }).toArray();
    
    // Populate with bike details
    const cartItemsWithDetails = await Promise.all(
      userCartItems.map(async (cartItem) => {
        const bike = await db.collection('bikes').findOne({ id: cartItem.bikeId });
        return {
          ...cartItem,
          bike
        };
      })
    );
    
    const validCartItems = cartItemsWithDetails.filter(item => item.bike);

    res.json({
      success: true,
      cartItems: validCartItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
});

// Add to cart
app.post('/api/cart/add', async (req, res) => {
  try {
    const { bikeId, quantity, userEmail } = req.body;
    const authEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!bikeId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'bikeId and quantity are required'
      });
    }

    const db = await connectToDatabase();

    // Check if bike exists
    const bike = await db.collection('bikes').findOne({ id: bikeId });
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    // Check if item already in cart
    const existingItem = await db.collection('cart').findOne({
      userEmail: authEmail,
      bikeId: bikeId
    });

    if (existingItem) {
      // Update quantity
      await db.collection('cart').updateOne(
        { _id: existingItem._id },
        { 
          $set: { 
            quantity: existingItem.quantity + quantity,
            updatedAt: new Date().toISOString()
          }
        }
      );
    } else {
      // Add new cart item
      const cartCount = await db.collection('cart').countDocuments();
      const newCartItem = {
        id: (cartCount + 1).toString(),
        userEmail: authEmail,
        bikeId,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.collection('cart').insertOne(newCartItem);
    }

    res.json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
});

// Update cart item quantity
app.put('/api/cart/update/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const { quantity } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const db = await connectToDatabase();

    const cartItem = await db.collection('cart').findOne({
      userEmail,
      bikeId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await db.collection('cart').updateOne(
      { _id: cartItem._id },
      { 
        $set: { 
          quantity: quantity,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating cart',
      error: error.message
    });
  }
});

// Remove from cart
app.delete('/api/cart/remove/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    const result = await db.collection('cart').deleteOne({
      userEmail,
      bikeId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
});

// Clear cart
app.delete('/api/cart/clear', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    await db.collection('cart').deleteMany({ userEmail });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
});

// ============================================
// WISHLIST ROUTES
// ============================================

// Get user's wishlist
app.get('/api/wishlist', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();

    const userWishlist = await db.collection('wishlist').find({ userEmail }).toArray();
    
    const wishlistWithBikes = await Promise.all(
      userWishlist.map(async (item) => {
        const bike = await db.collection('bikes').findOne({ id: item.bikeId });
        return { ...item, bike };
      })
    );
    
    const validWishlist = wishlistWithBikes.filter(item => item.bike);

    res.json({ success: true, wishlist: validWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching wishlist', error: error.message });
  }
});

// Add to wishlist
app.post('/api/wishlist/add', async (req, res) => {
  try {
    const { bikeId } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();

    // Check if already in wishlist
    const exists = await db.collection('wishlist').findOne({ userEmail, bikeId });
    
    if (exists) {
      return res.json({ success: true, message: 'Already in wishlist' });
    }

    const wishlistCount = await db.collection('wishlist').countDocuments();
    const newItem = {
      id: (wishlistCount + 1).toString(),
      userEmail,
      bikeId,
      createdAt: new Date().toISOString()
    };

    await db.collection('wishlist').insertOne(newItem);

    res.status(201).json({ success: true, message: 'Added to wishlist', item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding to wishlist', error: error.message });
  }
});

// Remove from wishlist
app.delete('/api/wishlist/remove/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();

    await db.collection('wishlist').deleteOne({ userEmail, bikeId });

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing from wishlist', error: error.message });
  }
});

// ============================================
// REVIEWS ROUTES
// ============================================

// Get reviews for a bike
app.get('/api/reviews/:bikeId', async (req, res) => {
  try {
    const { bikeId } = req.params;
    const db = await connectToDatabase();

    const bikeReviews = await db.collection('reviews').find({ bikeId }).toArray();
    
    // Calculate average rating
    const totalRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = bikeReviews.length > 0 ? (totalRating / bikeReviews.length).toFixed(1) : 0;

    res.json({ 
      success: true, 
      reviews: bikeReviews,
      stats: {
        count: bikeReviews.length,
        averageRating: parseFloat(averageRating)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
});

// Add a review
app.post('/api/reviews/add', async (req, res) => {
  try {
    const { bikeId, rating, comment, image } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const db = await connectToDatabase();

    const user = await db.collection('users').findOne({ email: userEmail });
    
    const newReview = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      bikeId,
      userEmail,
      userName: user ? user.name : userEmail.split('@')[0],
      rating: parseInt(rating),
      comment,
      image: image || "",
      createdAt: new Date().toISOString()
    };

    await db.collection('reviews').insertOne(newReview);
    
    // Update bike's rating and reviews count
    const bikeReviews = await db.collection('reviews').find({ bikeId }).toArray();
    const totalRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / bikeReviews.length).toFixed(1));
    
    await db.collection('bikes').updateOne(
      { id: bikeId },
      { $set: { rating: avgRating } }
    );

    res.status(201).json({ success: true, message: 'Review added successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding review', error: error.message });
  }
});

// Delete a review (Moderation / Owner)
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    // Check both custom ID and potential ObjectId
    let review = await db.collection('reviews').findOne({ id });
    
    if (!review) {
      // Try finding by ObjectId if not found by string ID
      try {
        const { ObjectId } = require('mongodb');
        review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // ID is not a valid ObjectId, ignore
      }
    }
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const user = await db.collection('users').findOne({ email: userEmail });

    // Authorization: Admin, Merchandiser, or Review Owner
    const isOwner = review.userEmail === userEmail;
    const isStaff = user && (user.role === 'admin' || user.role === 'merchandiser');

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const bikeId = review.bikeId;
    await db.collection('reviews').deleteOne({ _id: review._id });

    // Re-calculate bike's rating
    const bikeReviews = await db.collection('reviews').find({ bikeId }).toArray();
    if (bikeReviews.length > 0) {
      const totalRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / bikeReviews.length).toFixed(1));
      await db.collection('bikes').updateOne(
        { id: bikeId },
        { $set: { rating: avgRating } }
      );
    } else {
      await db.collection('bikes').updateOne(
        { id: bikeId },
        { $set: { rating: 0 } }
      );
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
});

// Get active promos (public - for PromoSlider)
app.get('/api/promos/active', async (req, res) => {
  try {
    const db = await connectToDatabase();
    
    // Fetch only active and non-expired promos
    const promos = await db.collection('promos').find({
      active: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).toArray();
    
    // Return only necessary fields for public display
    const publicPromos = promos.map(promo => ({
      code: promo.code,
      type: promo.type,
      discount: promo.discount,
      description: promo.description
    }));
    
    res.json({ success: true, promos: publicPromos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching active promos' });
  }
});

app.get('/api/promos', async (req, res) => {
  try {
    const db = await connectToDatabase();
    
    const promos = await db.collection('promos').find({}).toArray();
    
    res.json({
      success: true,
      promos: promos
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching promos' });
  }
});

// Admin Promo Management
app.post('/api/admin/promos', async (req, res) => {
  try {
    const { code, discount, type, description, expiresAt } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    // In real app, verify admin role here

    if (!code || !discount || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const db = await connectToDatabase();

    const existingPromo = await db.collection('promos').findOne({ code });
    if (existingPromo) {
      return res.status(400).json({ success: false, message: 'Promo code already exists' });
    }

    const newPromo = { code, discount, type, description, expiresAt };
    await db.collection('promos').insertOne(newPromo);

    res.json({ success: true, message: 'Promo created', promo: newPromo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating promo' });
  }
});

app.put('/api/admin/promos/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;
    const db = await connectToDatabase();
    
    const promo = await db.collection('promos').findOne({ code });
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo not found' });
    }

    const updatedPromo = { ...promo, ...updates };
    await db.collection('promos').updateOne(
      { code },
      { $set: updatedPromo }
    );

    res.json({ success: true, message: 'Promo updated', promo: updatedPromo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating promo', error: error.message });
  }
});

app.delete('/api/admin/promos/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const db = await connectToDatabase();
    
    const result = await db.collection('promos').deleteOne({ code });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Promo not found' });
    }
    res.json({ success: true, message: 'Promo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting promo' });
  }
});

app.post('/api/promos/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const db = await connectToDatabase();
    
    const promo = await db.collection('promos').findOne({ 
      code: { $regex: new RegExp(`^${code}$`, 'i') }
    });

    if (!promo) {
      return res.status(400).json({ success: false, message: 'Invalid promo code' });
    }

    // Check expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo code has expired' });
    }

    res.json({
      success: true,
      promo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error validating promo code' });
  }
});

// Create new order
app.post('/api/orders/create', async (req, res) => {

  try {
    const { 
      userEmail, 
      items, 
      shippingAddress, 
      paymentMethod, 
      paymentIntentId,
      subtotal, 
      tax, 
      shipping, 
      discount,
      promoCode,
      total 
    } = req.body;

    const authEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify Payment
    let paymentStatus = 'paid'; // Default for Stripe success
    if (paymentMethod === 'stripe') {
       if (!paymentIntentId) {
          return res.status(400).json({ success: false, message: 'Missing payment intent' });
       }
       // In a real app, verify Stripe intent status here
    } else if (paymentMethod === 'cod') {
       paymentStatus = 'pending'; // COD is pending
    }

    const db = await connectToDatabase();

    // Generate order number
    const orderCount = await db.collection('orders').countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`;

    // Create new order
    const newOrder = {
      id: (orderCount + 1).toString(),
      orderNumber,
      userEmail: authEmail,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus, 
      status: 'confirmed',
      subtotal,
      tax,
      shipping,
      discount: discount || 0,
      promoCode: promoCode || null,
      total,
      tracking: [
        { status: 'placed', label: 'Order Placed', timestamp: new Date().toISOString(), completed: true }
      ],
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    await db.collection('orders').insertOne(newOrder);

    // Clear user's cart after order
    await db.collection('cart').deleteMany({ userEmail: authEmail });

    // Send confirmation email (don't block order creation if email fails)
    const emailHeader = paymentMethod === 'cod' ? 'Order Invoice (COD)' : 'Order Invoice & Confirmation';
    const emailHtml = generateOrderEmail(newOrder);
    
    // Send email asynchronously without blocking the response
    sendEmail(
      authEmail, 
      `${emailHeader} - #${orderNumber}`, 
      emailHtml
    ).catch(err => {
      console.error('⚠️ Failed to send order confirmation email:', err.message);
      // Continue anyway - order was created successfully
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Get user's orders
app.get('/api/orders', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    const userOrders = await db.collection('orders')
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      orders: userOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get single order by order number
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    const order = await db.collection('orders').findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order (or is admin)
    if (order.userEmail !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Resend order confirmation email
app.post('/api/orders/:orderNumber/email', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    const order = await db.collection('orders').findOne({ orderNumber });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Verify authorization
    const user = await db.collection('users').findOne({ email: userEmail });
    const isAuthorized = order.userEmail === userEmail || 
                         (user && ['admin', 'merchandiser'].includes(user.role));
    
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Generate and send email
    const emailHtml = generateOrderEmail(order);
    const recipient = order.shippingAddress?.email || order.userEmail;
    
    await sendEmail(recipient, `Order Confirmation - ${order.orderNumber}`, emailHtml);
    
    console.log(`📧 Email sent for order ${orderNumber} to ${recipient}`);
    res.json({ success: true, message: 'Email sent successfully', sentTo: recipient });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Update order status (e.g., cancel, process, ship, deliver)
app.post('/api/orders/status/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body; // e.g., 'cancelled', 'processing', 'shipped', 'delivered'
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      });
    }

    const db = await connectToDatabase();
    
    const order = await db.collection('orders').findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Basic authorization: only owner can cancel, admin/merchandiser can change any status
    const user = await db.collection('users').findOne({ email: userEmail });
    const isStaff = user && (user.role === 'admin' || user.role === 'merchandiser');

    if (order.userEmail !== userEmail && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    // Specific logic for 'cancelled' status if not staff
    if (status === 'cancelled' && !isStaff) {
      if (!['confirmed', 'processing'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled in '${order.status}' status`
        });
      }
    }

    // Prepare tracking update
    const trackingEntry = {
      status: status,
      label: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      timestamp: new Date().toISOString(),
      completed: true
    };

    // Update status and tracking
    await db.collection('orders').updateOne(
      { orderNumber },
      { 
        $set: { 
          status,
          updatedAt: new Date().toISOString()
        },
        $push: {
          tracking: trackingEntry
        }
      }
    );

    // Send status update email (don't block status update if email fails)
    const statusEmailHtml = generateStatusUpdateEmail(order, status);
    sendEmail(
      order.userEmail,
      `Order Status Update - #${orderNumber}`,
      statusEmailHtml
    ).catch(err => {
      console.error('⚠️ Failed to send status update email:', err.message);
      // Continue anyway - status was updated successfully
    });

    const updatedOrder = await db.collection('orders').findOne({ orderNumber });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// ============================================
// DUPLICATE ENDPOINT REMOVED
// The correct endpoint is at line 2027
// ============================================

// (Removed duplicate /api/orders/:orderNumber/email endpoint)


// Get all orders (admin only - for now, any authenticated user)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const db = await connectToDatabase();

    // Get all orders sorted by most recent first
    const allOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      orders: allOrders,
      count: allOrders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Generate Dealer Quote
app.post('/api/quotes', async (req, res) => {
  try {
    const { items, userEmail, dealerInfo } = req.body;
    const authHeader = req.headers.authorization;
    const authEmail = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!authEmail || authEmail !== userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();

    const subtotal = items.reduce((sum, item) => sum + (item.bike.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const shipping = 0; 
    const total = subtotal + tax + shipping;

    const quoteId = 'Q-' + Date.now().toString().slice(-6);
    
    const newQuote = {
      id: Date.now().toString(),
      quoteId,
      userEmail,
      items,
      subtotal,
      tax,
      shipping,
      total,
      dealerInfo,
      status: 'generated',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    await db.collection('quotes').insertOne(newQuote);

    // Send Quote Email
    sendEmail(
      userEmail,
      `Dealer Quote Generated - #${quoteId}`,
      `<h1>Dealer Price Quote #${quoteId}</h1><p>Total Estimate: $${total.toLocaleString()}</p><p>Valid for 30 days.</p>`
    );

    res.json({
      success: true,
      quote: newQuote,
      message: 'Quote generated successfully'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating quote', error: error.message });
  }
});

// Get User Quotes
app.get('/api/quotes/my-quotes', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    
    const userQuotes = await db.collection('quotes')
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      quotes: userQuotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching quotes' });
  }
});

// ============================================
// STRIPE PAYMENT ROUTES
// ============================================

// Create Payment Intent for Checkout
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items, userEmail } = req.body;
    const authEmail = req.headers.authorization?.replace('Bearer ', '');

    if (!authEmail || authEmail !== userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    const db = await connectToDatabase();

    // Calculate total from items
    let total = 0;
    for (const item of items) {
      const bike = await db.collection('bikes').findOne({ id: item.bikeId });
      if (bike) {
        total += bike.price * item.quantity;
      }
    }

    // Add tax and shipping
    const tax = total * 0.1;
    const shipping = 500;
    const finalAmount = Math.round((total + tax + shipping) * 100); // Convert to cents

    // Check if using real Stripe or mock mode
    // Use mock mode if: env var is set, key is placeholder, or key doesn't exist
    const isMock = process.env.STRIPE_MOCK_MODE === 'true' || 
                   !STRIPE_SECRET_KEY || 
                   STRIPE_SECRET_KEY.includes('PLACEHOLDER') || 
                   STRIPE_SECRET_KEY.includes('sk_test_51O');
    
    if (isMock) {
      // Mock mode - return mock client secret
      return res.json({
        success: true,
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        isMock: true,
        message: 'Using mock payment mode'
      });
    }

    // Real Stripe mode - create actual payment intent
    console.log('Creating Stripe Payment Intent with amount:', finalAmount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userEmail,
        orderType: 'bike_purchase'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      isMock: false
    });

  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
});

// ============================================
// PROMO CODE ROUTES
// ============================================

// Validate Promo Code
app.post('/api/promos/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const db = await connectToDatabase();
    
   // Find promo code (case-insensitive)
    const promo = await db.collection('promos').findOne({ 
      code: new RegExp(`^${code}$`, 'i') 
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo is active
    if (!promo.active) {
      return res.status(400).json({
        success: false,
        message: 'This promo code is no longer active'
      });
    }

    // Check expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This promo code has expired'
      });
    }

    // Check usage limit
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This promo code has reached its usage limit'
      });
    }

    res.json({
      success: true,
      promo: {
        code: promo.code,
        type: promo.type,
        discount: promo.discount,
        description: promo.description
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating promo code',
      error: error.message
    });
  }
});

// Get active promos (public - for PromoSlider)
app.get('/api/promos/active', async (req, res) => {
  try {
    const db = await connectToDatabase();
    
    // Fetch only active and non-expired promos
    const promos = await db.collection('promos').find({
      active: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).toArray();
    
    // Return only necessary fields for public display
    const publicPromos = promos.map(promo => ({
      code: promo.code,
      type: promo.type,
      discount: promo.discount,
      description: promo.description
    }));
    
    res.json({ success: true, promos: publicPromos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching active promos' });
  }
});

// Get all promos (admin only)
app.get('/api/promos', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: userEmail });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const promos = await db.collection('promos').find({}).toArray();
    res.json({ success: true, promos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching promos' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     MotruBi API Server Running         ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Time: ${new Date().toLocaleString()}    ║
╚════════════════════════════════════════╝
  `);
});
