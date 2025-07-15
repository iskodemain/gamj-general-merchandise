import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { connectToDatabase } from './config/sequelize.js';
import connectCloudinary from './config/cloudinary.js';
import customerRouter from './routes/customerRoute.js';
import multer from 'multer';

// APP CONFIG
const app = express();
const port = process.env.PORT || 5001;
connectCloudinary();


// MIDDLEWARES
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/customer', customerRouter)


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

// START SERVER
const startServer = async () => {
    try {
        await connectToDatabase();
        app.listen(port, () => {
            console.log("Server Start on PORT: " + port);
        })
    } catch (error) {
        console.log("Error connecting to the database: " + error)
    }
}
startServer();