import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Favorites routes
router.route('/favorites').get(getFavorites).post(addFavorite);
router.delete('/favorites/:countryCode', removeFavorite);
router.get('/favorites/check/:countryCode', checkFavorite);

export default router; 