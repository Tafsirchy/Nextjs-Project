const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const STRIPE_SECRET_KEY = 'sk_test_51O...[PLACEHOLDER]...';
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;
// Mock Email Service
const sendEmail = (to, subject, htmlBody) => {
  console.log('--------------------------------------------------');
  console.log(`MOCK EMAIL SENT TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY (HTML Preview): ${htmlBody.substring(0, 100)}...`);
  console.log('--------------------------------------------------');
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

// --- DATA PERSISTENCE ---
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Helper function to read data
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { bikes: [] };
  }
}

// Helper function to write data
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

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
    const data = await readData();
    const { category, featured, minPrice, maxPrice, search, onSale, inStock } = req.query;
    
    let bikes = data.bikes || [];
    
    // Filter by category
    if (category && category !== 'all') {
      bikes = bikes.filter(bike => 
        bike.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by featured
    if (featured === 'true') {
      bikes = bikes.filter(bike => bike.featured === true);
    }

    // Filter by on sale (items with price < 10000)
    if (onSale === 'true') {
      bikes = bikes.filter(bike => bike.price < 10000);
    }

    // Filter by in stock
    if (inStock === 'true') {
      bikes = bikes.filter(bike => bike.stock > 0);
    }
    
    // Filter by price range
    if (minPrice) {
      bikes = bikes.filter(bike => bike.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      bikes = bikes.filter(bike => bike.price <= parseInt(maxPrice));
    }
    
    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      bikes = bikes.filter(bike => 
        bike.name.toLowerCase().includes(searchLower) ||
        bike.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      success: true,
      count: bikes.length,
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

// Get single bike by ID
app.get('/api/bikes/:id', async (req, res) => {
  try {
    const data = await readData();
    const bike = data.bikes.find(b => b.id === req.params.id);
    
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

// Get user's created bikes (inventory)
app.get('/api/bikes/my-inventory', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const data = await readData();
    const user = data.users?.find(u => u.email === userEmail);
    
    // Admins can see all bikes, others see only their created bikes
    let myBikes;
    if (user?.role === 'admin') {
      myBikes = data.bikes || [];
    } else {
      myBikes = (data.bikes || []).filter(bike => bike.createdBy === userEmail);
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

// Create new bike
app.post('/api/bikes', async (req, res) => {
  try {
    const { name, category, price, description, image, stock, engine, power, topSpeed, weight, features, colors } = req.body;
    const creatorEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!creatorEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Validation
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, category, price, description'
      });
    }
    
    const data = await readData();
    
    // Generate new ID
    const maxId = data.bikes.length > 0 
      ? Math.max(...data.bikes.map(b => parseInt(b.id))) 
      : 0;
    const newId = (maxId + 1).toString();
    
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
    
    // Add to data
    data.bikes.push(newBike);
    
    // Save to file
    const saved = await writeData(data);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error saving bike to database'
      });
    }
    
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
    
    const data = await readData();
    const bikeIndex = data.bikes.findIndex(b => b.id === req.params.id);
    
    if (bikeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check permissions: only creator or admin can update
    const user = data.users?.find(u => u.email === userEmail);
    const bike = data.bikes[bikeIndex];
    const isCreator = bike.createdBy === userEmail;
    const isAdmin = user?.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this bike'
      });
    }
    
    // Update bike with new data
    data.bikes[bikeIndex] = {
      ...data.bikes[bikeIndex],
      ...req.body,
      id: req.params.id // Preserve original ID
    };
    
    // Save to file
    const saved = await writeData(data);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error updating bike to database'
      });
    }
    
    res.json({
      success: true,
      message: 'Bike updated successfully',
      bike: data.bikes[bikeIndex]
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
    
    const data = await readData();
    const bikeIndex = data.bikes.findIndex(b => b.id === req.params.id);
    
    if (bikeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }
    
    // Check permissions: only creator or admin can delete
    const user = data.users?.find(u => u.email === userEmail);
    const bike = data.bikes[bikeIndex];
    const isCreator = bike.createdBy === userEmail;
    const isAdmin = user?.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this bike'
      });
    }
    
    // Remove bike
    const deletedBike = data.bikes.splice(bikeIndex, 1)[0];
    
    // Save to file
    const saved = await writeData(data);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting bike from database'
      });
    }
    
    res.json({
      success: true,
      message: 'Bike deleted successfully',
      bike: deletedBike
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
    
    const data = await readData();
    
    // Find the bike
    const bike = data.bikes.find(b => b.id === bikeId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    let userRole = 'customer';
    
    // Get user role if authenticated
    if (userEmail && data.users) {
      const user = data.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
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
      const user = data.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
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
    
    const data = await readData();
    
    // Initialize users array if it doesn't exist
    if (!data.users) {
      data.users = [];
    }
    
    // Check if email already exists
    const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Create new user
    const newUser = {
      id: (data.users.length + 1).toString(),
      name,
      email: email.toLowerCase(),
      password, // In production, hash this!
      role: userRole,
      isVerified: userRole === 'customer' ? true : false, // Customers are verified by default, others need approval
      createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    
    // Save to file
    const saved = await writeData(data);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error saving user to database'
      });
    }
    
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
    
    const data = await readData();
    
    if (!data.users) {
      data.users = [];
    }
    
    // Find user
    const user = data.users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
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

    const data = await readData();
    const userIndex = data.users.findIndex(u => u.email.toLowerCase() === userEmail.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (data.users[userIndex].role !== 'dealer') {
      return res.status(400).json({ success: false, message: 'Only dealers can submit verification' });
    }

    // Update user with verification data
    data.users[userIndex].dealerInfo = {
      businessName,
      taxId,
      address,
      phone,
      submittedAt: new Date().toISOString()
    };
    data.users[userIndex].verificationStatus = 'pending';

    await writeData(data);

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
    
    const data = await readData();
    const userIndex = data.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    data.users[userIndex].isVerified = status === 'verified';
    data.users[userIndex].verificationStatus = status;

    await writeData(data);

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

    const data = await readData();
    const userIndex = data.users.findIndex(u => u.email === userEmail);

    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

    data.users[userIndex].dealerInfo = {
      businessName,
      taxId,
      address,
      phone,
      updatedAt: new Date().toISOString()
    };

    await writeData(data);
    res.json({ success: true, message: 'Dealer information updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating dealer info' });
  }
});

// Addresses
app.get('/api/user/addresses', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    if (!data.addresses) data.addresses = [];
    
    const userAddresses = data.addresses.filter(a => a.userEmail === userEmail);
    res.json({ success: true, addresses: userAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses' });
  }
});

app.post('/api/user/addresses', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    if (!data.addresses) data.addresses = [];

    const newAddress = {
      ...req.body,
      id: Date.now().toString(),
      userEmail,
      createdAt: new Date().toISOString()
    };

    data.addresses.push(newAddress);
    await writeData(data);
    res.json({ success: true, address: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding address' });
  }
});

app.delete('/api/user/addresses/:id', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    if (!data.addresses) data.addresses = [];

    data.addresses = data.addresses.filter(a => !(a.id === req.params.id && a.userEmail === userEmail));
    await writeData(data);
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

    const data = await readData();
    if (!data.reviews) data.reviews = [];

    const userReviews = data.reviews.filter(r => r.userEmail === userEmail).map(r => {
      const bike = data.bikes.find(b => b.id === r.bikeId);
      return { ...r, bikeName: bike?.name || 'Unknown Bike' };
    });

    res.json({ success: true, reviews: userReviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Admin Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    // In a real app we would check if this user is an admin
    const users = data.users.map(({ password, ...u }) => u);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Change user role
app.post('/api/admin/users/role', async (req, res) => {
  try {
    const { email, role } = req.body;
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    
    const data = await readData();
    const adminUser = data.users.find(u => u.email === adminEmail);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const userIndex = data.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

    data.users[userIndex].role = role;
    await writeData(data);

    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating role' });
  }
});

// Get platform settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const data = await readData();
    const adminUser = data.users?.find(u => u.email === adminEmail);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Initialize settings if not present
    if (!data.settings) {
      data.settings = {
        maintenanceMode: false,
        dealerAutoApproval: false
      };
      await writeData(data);
    }

    res.json({ success: true, settings: data.settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
});

// Update platform settings
app.put('/api/admin/settings', async (req, res) => {
  try {
    const { maintenanceMode, dealerAutoApproval } = req.body;
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const data = await readData();
    const adminUser = data.users?.find(u => u.email === adminEmail);
    
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Initialize settings if not present
    if (!data.settings) {
      data.settings = {};
    }

    // Update only provided fields
    if (maintenanceMode !== undefined) data.settings.maintenanceMode = maintenanceMode;
    if (dealerAutoApproval !== undefined) data.settings.dealerAutoApproval = dealerAutoApproval;

    await writeData(data);

    res.json({ success: true, settings: data.settings, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating settings' });
  }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const adminEmail = req.headers.authorization?.replace('Bearer ', '');
    const data = await readData();
    const adminUser = data.users.find(u => u.email === adminEmail);
    if (!adminUser || (adminUser.role !== 'admin' && adminUser.role !== 'merchandiser')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const totalSales = (data.orders || []).reduce((sum, o) => sum + o.total, 0);
    const totalOrders = (data.orders || []).length;
    const totalUsers = data.users.length;
    const totalBikes = data.bikes.length;
    const totalInventory = data.bikes.reduce((sum, b) => sum + b.stock, 0);

    // Group sales by day
    const salesByDay = (data.orders || []).reduce((acc, o) => {
      const date = o.createdAt.split('T')[0];
      acc[date] = (acc[date] || 0) + o.total;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalUsers,
        totalBikes,
        totalInventory,
        salesByDay
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// Bulk Upload Bikes
app.post('/api/bikes/bulk', async (req, res) => {
  try {
    const bikes = req.body; // Expecting an array
    if (!Array.isArray(bikes)) return res.status(400).json({ success: false, message: 'Expected an array of bikes' });

    const data = await readData();
    let maxId = data.bikes.length > 0 ? Math.max(...data.bikes.map(b => parseInt(b.id))) : 0;

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

    data.bikes.push(...newBikes);
    await writeData(data);

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

    const data = await readData();
    
    if (!data.cart) {
      data.cart = [];
    }

    // Get user's cart items
    const userCartItems = data.cart.filter(item => item.userEmail === userEmail);
    
    // Populate with bike details
    const cartItemsWithDetails = userCartItems.map(cartItem => {
      const bike = data.bikes.find(b => b.id === cartItem.bikeId);
      return {
        ...cartItem,
        bike
      };
    }).filter(item => item.bike); // Filter out items where bike doesn't exist

    res.json({
      success: true,
      cartItems: cartItemsWithDetails
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

    const data = await readData();
    
    if (!data.cart) {
      data.cart = [];
    }

    // Check if bike exists
    const bike = data.bikes.find(b => b.id === bikeId);
    if (!bike) {
      return res.status(404).json({
        success: false,
        message: 'Bike not found'
      });
    }

    // Check if item already in cart
    const existingItemIndex = data.cart.findIndex(
      item => item.userEmail === authEmail && item.bikeId === bikeId
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      data.cart[existingItemIndex].quantity += quantity;
      data.cart[existingItemIndex].updatedAt = new Date().toISOString();
    } else {
      // Add new cart item
      const newCartItem = {
        id: (data.cart.length + 1).toString(),
        userEmail: authEmail,
        bikeId,
        quantity,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.cart.push(newCartItem);
    }

    const saved = await writeData(data);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error saving to cart'
      });
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

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const data = await readData();
    res.json({
      success: true,
      users: data.users.map(({ password, ...u }) => u)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
});

// Update Dealer Info
app.put('/api/dealer/info', async (req, res) => {
  try {
    const { dealerInfo } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await readData();
    const userIndex = data.users.findIndex(u => u.email === userEmail);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    data.users[userIndex].dealerInfo = {
      ...data.users[userIndex].dealerInfo,
      ...dealerInfo
    };

    await writeData(data);
    res.json({ success: true, message: 'Dealer information updated successfully', user: data.users[userIndex] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating dealer info', error: error.message });
  }
});

// --- ADDRESSES ---
app.get('/api/user/addresses', async (req, res) => {
  try {
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    const userAddresses = (data.addresses || []).filter(a => a.userEmail === userEmail);
    res.json({ success: true, addresses: userAddresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
});

app.post('/api/user/addresses', async (req, res) => {
  try {
    const { address } = req.body;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    if (!data.addresses) data.addresses = [];

    const newAddress = {
      ...address,
      id: Date.now().toString(),
      userEmail
    };

    data.addresses.push(newAddress);
    await writeData(data);
    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving address', error: error.message });
  }
});

app.delete('/api/user/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const data = await readData();
    if (!data.addresses) data.addresses = [];

    const index = data.addresses.findIndex(a => a.id === id && a.userEmail === userEmail);
    if (index === -1) return res.status(404).json({ success: false, message: 'Address not found' });

    data.addresses.splice(index, 1);
    await writeData(data);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting address', error: error.message });
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

    const data = await readData();
    
    if (!data.cart) {
      data.cart = [];
    }

    const cartItemIndex = data.cart.findIndex(
      item => item.userEmail === userEmail && item.bikeId === bikeId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    data.cart[cartItemIndex].quantity = quantity;
    data.cart[cartItemIndex].updatedAt = new Date().toISOString();

    const saved = await writeData(data);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error updating cart'
      });
    }

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

    const data = await readData();
    
    if (!data.cart) {
      data.cart = [];
    }

    const initialLength = data.cart.length;
    data.cart = data.cart.filter(
      item => !(item.userEmail === userEmail && item.bikeId === bikeId)
    );

    if (data.cart.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const saved = await writeData(data);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error removing from cart'
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

    const data = await readData();
    
    if (!data.cart) {
      data.cart = [];
    }

    data.cart = data.cart.filter(item => item.userEmail !== userEmail);

    const saved = await writeData(data);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error clearing cart'
      });
    }

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

    const data = await readData();
    if (!data.wishlist) data.wishlist = [];

    const userWishlist = data.wishlist
      .filter(item => item.userEmail === userEmail)
      .map(item => {
        const bike = data.bikes.find(b => b.id === item.bikeId);
        return { ...item, bike };
      })
      .filter(item => item.bike); // Only return items where bike exists

    res.json({ success: true, wishlist: userWishlist });
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

    const data = await readData();
    if (!data.wishlist) data.wishlist = [];

    // Check if already in wishlist
    const exists = data.wishlist.find(item => item.userEmail === userEmail && item.bikeId === bikeId);
    
    if (exists) {
      return res.json({ success: true, message: 'Already in wishlist' });
    }

    const newItem = {
      id: (data.wishlist.length + 1).toString(),
      userEmail,
      bikeId,
      createdAt: new Date().toISOString()
    };

    data.wishlist.push(newItem);
    await writeData(data);

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

    const data = await readData();
    if (!data.wishlist) data.wishlist = [];

    data.wishlist = data.wishlist.filter(item => !(item.userEmail === userEmail && item.bikeId === bikeId));
    await writeData(data);

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
    const data = await readData();
    if (!data.reviews) data.reviews = [];

    const bikeReviews = data.reviews.filter(r => r.bikeId === bikeId);
    
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

    const data = await readData();
    if (!data.reviews) data.reviews = [];

    const user = data.users.find(u => u.email === userEmail);
    
    const newReview = {
      id: (data.reviews.length + 1).toString(),
      bikeId,
      userEmail,
      userName: user ? user.name : userEmail.split('@')[0],
      rating: parseInt(rating),
      comment,
      image: image || "",
      createdAt: new Date().toISOString()
    };

    data.reviews.push(newReview);
    
    // Update bike's rating and reviews count (if we want to cache it)
    const bikeIndex = data.bikes.findIndex(b => b.id === bikeId);
    if (bikeIndex !== -1) {
      const bikeReviews = data.reviews.filter(r => r.bikeId === bikeId);
      const totalRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0);
      data.bikes[bikeIndex].rating = parseFloat((totalRating / bikeReviews.length).toFixed(1));
    }

    await writeData(data);

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

    const data = await readData();
    const reviewIndex = data.reviews.findIndex(r => r.id === id);
    
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const user = data.users.find(u => u.email === userEmail);
    const review = data.reviews[reviewIndex];

    // Authorization: Admin, Merchandiser, or Review Owner
    const isOwner = review.userEmail === userEmail;
    const isStaff = user && (user.role === 'admin' || user.role === 'merchandiser');

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const bikeId = review.bikeId;
    data.reviews.splice(reviewIndex, 1);

    // Re-calculate bike's rating
    const bikeIndex = data.bikes.findIndex(b => b.id === bikeId);
    if (bikeIndex !== -1) {
      const bikeReviews = data.reviews.filter(r => r.bikeId === bikeId);
      if (bikeReviews.length > 0) {
        const totalRating = bikeReviews.reduce((sum, r) => sum + r.rating, 0);
        data.bikes[bikeIndex].rating = parseFloat((totalRating / bikeReviews.length).toFixed(1));
      } else {
        data.bikes[bikeIndex].rating = 0;
      }
    }

    await writeData(data);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting review', error: error.message });
  }
});

app.get('/api/promos', async (req, res) => {
  try {
    const data = await readData();
    res.json({
      success: true,
      promos: data.promos || []
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

    const data = await readData();
    if (!data.promos) data.promos = [];

    if (data.promos.find(p => p.code === code)) {
      return res.status(400).json({ success: false, message: 'Promo code already exists' });
    }

    const newPromo = { code, discount, type, description, expiresAt };
    data.promos.push(newPromo);
    await writeData(data);

    res.json({ success: true, message: 'Promo created', promo: newPromo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating promo' });
  }
});

app.put('/api/admin/promos/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const updates = req.body;
    const data = await readData();
    
    const index = data.promos.findIndex(p => p.code === code);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Promo not found' });
    }

    data.promos[index] = { ...data.promos[index], ...updates };
    await writeData(data);

    res.json({ success: true, message: 'Promo updated', promo: data.promos[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating promo' });
  }
});

app.delete('/api/admin/promos/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const data = await readData();
    
    const initialLength = data.promos.length;
    data.promos = data.promos.filter(p => p.code !== code);
    
    if (data.promos.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Promo not found' });
    }

    await writeData(data);
    res.json({ success: true, message: 'Promo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting promo' });
  }
});

app.post('/api/promos/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const data = await readData();
    
    if (!data.promos) {
      return res.status(404).json({ success: false, message: 'Promo codes not found' });
    }

    const promo = data.promos.find(p => p.code.toUpperCase() === code.toUpperCase());

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
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

// ============================================
// PAYMENT ROUTES (STRIPE)
// ============================================

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { items, userEmail } = req.body;
    console.log("Creating payment intent for:", userEmail, items);
    
    const data = await readData();
    
    // Calculate total on server for security
    let subtotal = 0;
    for (const item of items) {
      const bike = data.bikes.find(b => b.id === item.id);
      if (bike) {
        subtotal += bike.price * item.quantity;
      }
    }

    const tax = subtotal * 0.1;
    const shipping = 500;
    const total = subtotal + tax + shipping;

    console.log(`Calculated total: ${total} (Sub: ${subtotal}, Tax: ${tax}, Ship: ${shipping})`);

    // Mock Mode Fallback for testing without a real Stripe key
    const isMock = !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('PLACEHOLDER');
    
    if (isMock) {
      console.log("USING MOCK PAYMENT INTENT (Invalid/Placeholder Key detected)");
      return res.json({
        success: true,
        clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(7),
        isMock: true
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userEmail,
        orderTotal: total.toString()
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ success: false, message: 'Error creating payment intent', error: error.message });
  }
});

// ============================================
// ORDERS ROUTES
// ============================================

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

    const data = await readData();
    if (!data.orders) data.orders = [];

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(data.orders.length + 1).padStart(5, '0')}`;

    // Create new order
    const newOrder = {
      id: (data.orders.length + 1).toString(),
      orderNumber,
      userEmail: authEmail,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus, 
      status: 'confirmed', // Order is confirmed placed, payment pending for COD
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
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };

    data.orders.push(newOrder);

    // Clear user's cart after order
    if (data.cart) {
      data.cart = data.cart.filter(item => item.userEmail !== authEmail);
    }

    const saved = await writeData(data);

    if (saved) {
      // Send confirmation email
      const emailHeader = paymentMethod === 'cod' ? 'Order Invoice (COD)' : 'Order Invoice & Confirmation';
      const emailHtml = generateOrderEmail(newOrder);
      sendEmail(
        authEmail, 
        `${emailHeader} - #${orderNumber}`, 
        emailHtml
      );
    }


    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Error creating order'
      });
    }

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

    const data = await readData();
    
    if (!data.orders) {
      data.orders = [];
    }

    const userOrders = data.orders.filter(order => order.userEmail === userEmail);
    
    // Sort by most recent first
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

    const data = await readData();
    
    if (!data.orders) {
      data.orders = [];
    }

    const order = data.orders.find(o => o.orderNumber === orderNumber);

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

    const data = await readData();
    const orderIndex = data.orders.findIndex(o => o.orderNumber === orderNumber);

    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = data.orders[orderIndex];

    // Basic authorization: only owner can cancel, admin can change any status
    const user = data.users.find(u => u.email === userEmail);
    const isAdmin = user && user.role === 'admin';

    if (order.userEmail !== userEmail && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    // Specific logic for 'cancelled' status if not admin
    if (status === 'cancelled' && !isAdmin) {
      if (!['confirmed', 'processing'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Order cannot be cancelled in '${order.status}' status`
        });
      }
    }

    // Update status
    data.orders[orderIndex].status = status;
    data.orders[orderIndex].updatedAt = new Date().toISOString();

    await writeData(data);

    // Send status update email
    sendEmail(
      data.orders[orderIndex].userEmail,
      `Order Update - #${orderNumber}`,
      `Your order #${orderNumber} status has been updated to: ${status.toUpperCase()}`
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: data.orders[orderIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// Resend Order Invoice Email
app.post('/api/orders/:orderNumber/email', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await readData();
    const order = data.orders.find(o => o.orderNumber === orderNumber);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userEmail !== userEmail) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const emailHtml = generateOrderEmail(order);
    sendEmail(
      userEmail,
      `Invoice: Order #${orderNumber}`,
      emailHtml
    );

    res.json({
      success: true,
      message: 'Invoice sent successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
});

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

    const data = await readData();
    
    if (!data.orders) {
      data.orders = [];
    }

    // Sort by most recent first
    const allOrders = [...data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

    const data = await readData();
    const subtotal = items.reduce((sum, item) => sum + (item.bike.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    if (!data.quotes) data.quotes = [];
    data.quotes.push(newQuote);
    await writeData(data);

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

    const data = await readData();
    const userQuotes = (data.quotes || []).filter(q => q.userEmail === userEmail);
    
    // Sort by recent
    userQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      quotes: userQuotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching quotes' });
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
