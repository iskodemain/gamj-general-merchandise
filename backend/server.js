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
import multer from 'multer';
import { Server } from 'socket.io';
import http from 'http';




// APP CONFIG
const app = express();
const port = process.env.PORT || 5001;
connectCloudinary();


// MIDDLEWARES
app.use(express.json());
app.use(cors());

// SOCKET.IO SETUP
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // customer
      "http://localhost:5174", // admin
      "http://localhost:5175", // staff
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ROUTES
app.use('/api/customer', customerRouter);
app.use('/api/product', productRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/notification', notificationRouter);


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
        server.listen(port, () => {
            console.log("Server running on PORT: " + port);
        })
    } catch (error) {
        console.log("Error connecting to the database: " + error)
    }
}
startServer();