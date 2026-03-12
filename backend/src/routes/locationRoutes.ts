import { Router } from 'express';
import { searchLocations } from '../controllers/locationController';

const router = Router();
router.get('/search', searchLocations);

export default router;
