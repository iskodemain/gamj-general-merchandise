import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { connectToDatabase } from './config/sequelize.js';
import connectCloudinary from './config/cloudinary.js';
import customerRouter from './routes/customerRoute.js';
import productRouter from './routes/productRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import notificationRouter from './routes/notificationRoute.js';
import paypalRouter from './routes/paypalRoute.js';
import multer from 'multer';
import { Server } from 'socket.io';
import http from 'http';
import adminRouter from './routes/admin/adminRoute.js';
import adminProductRouter from './routes/admin/adminProductRoute.js';
import adminOrderRouter from './routes/admin/adminOrderRoute.js';
import adminUsersRouter from './routes/admin/adminUsersRoute.js';
import adminSettingsRouter from './routes/admin/adminSettingsRoute.js';
import cusomerSettingsRouter from './routes/customerSettingsRoute.js';
import adminInventoryRouter from './routes/admin/adminInventoryRoute.js';
import adminNotificationRouter from './routes/admin/adminNotificationRoute.js';
import adminLocationRouter from './routes/admin/adminLocationRoute.js';
import adminPolicyRoute from './routes/admin/adminPolicyRoute.js';
import { createSuperAdminIfNotExists } from './scripts/createSuperAdmin.js';
import { sequelize } from './config/sequelize.js';

// APP CONFIG
const app = express();
const port = process.env.PORT || 5001;
connectCloudinary();


// MIDDLEWARES
app.use(express.json());

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://gamj-general-merchandise-customer.vercel.app",
  "https://gamj-general-merchandise-admin.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests like curl or mobile apps
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// SOCKET.IO SETUP
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

// CUSTOMER ROUTES
app.use('/api/customer', customerRouter);
app.use('/api/product', productRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/paypal', paypalRouter);
app.use('/api/business-info', cusomerSettingsRouter);

// ADMIN ROUTES
app.use('/api/admin', adminRouter);
app.use('/api/admin/product', adminProductRouter);
app.use('/api/order', adminOrderRouter);
app.use('/api/users', adminUsersRouter);
app.use('/api/settings', adminSettingsRouter);
app.use('/api/inventory', adminInventoryRouter);
app.use('/api/admin/notification', adminNotificationRouter);
app.use('/api/location', adminLocationRouter);
app.use('/api/policies', adminPolicyRoute);


// TEST
app.get('/', (req, res) => {
    res.send("API Working")
}) 

// GLOBAL ERROR HANDLER 
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Invalid image upload. Please try again.`
      });
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image file too large. Maximum size allowed is 10MB.'
      });
    }

    return res.status(400).json({
        success: false,
        message: `Multer Error: ${err.message}`
        });
    }

  if (err.message && err.message.includes("Only image formats")) {
    return res.status(400).json({ 
        success: false, 
        message: err.message 
    });
  }

  return res.status(500).json({ 
    success: false, 
    message: "Something went wrong."
 });
});



// SOCKET.IO CONNECTION LOG
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});


// START SERVER
const startServer = async () => {
    try {
        await connectToDatabase();
        // await sequelize.sync({ alter: true }); 
        console.log("Database connected successfully.");
        createSuperAdminIfNotExists()
        server.listen(port, () => {
            console.log("Server running on PORT: " + port);
        })
    } catch (error) {
        console.log("Error connecting to the database: " + error)
    }
}
startServer();
