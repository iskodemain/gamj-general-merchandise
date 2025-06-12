// ADD COMMENT BY BERNIL

import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import { connectToDatabase } from './config/sequelize.js';
import connectCloudinary from './config/cloudinary.js';

// APP CONFIG
const app = express();
const port = process.env.PORT || 5001;
connectCloudinary()


// MIDDLEWARES
app.use(express.json());
app.use(cors());


// API ENDPOINTS
app.get('/', (req, res) => {
    res.send("API Working")
}) 

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