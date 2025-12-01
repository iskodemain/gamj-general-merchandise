import express from 'express';
import { fetchBusinessInfo } from '../controllers/customerSettingsController.js';


const cusomerSettingsRouter = express.Router();

// FETCH
cusomerSettingsRouter.get('/', fetchBusinessInfo);


export default cusomerSettingsRouter;
