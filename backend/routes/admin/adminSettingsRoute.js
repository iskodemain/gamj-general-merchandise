import express from 'express';
import { fetchSettingsData, updateSettingsData } from "../../controllers/admin/adminSettingsController.js";

import adminAuth from "../../middleware/adminAuth.js";
import upload from '../../middleware/multer.js';


const adminSettingsRouter = express.Router();

// FETCH
adminSettingsRouter.get('/', fetchSettingsData);

// UPDATE
adminSettingsRouter.put(
    '/update', 
    adminAuth, 
    upload.fields([
        { name: 'businessLogo', maxCount: 1 },
        { name: 'homeCoverImage', maxCount: 1 }
    ]),
    updateSettingsData
);


export default adminSettingsRouter;
