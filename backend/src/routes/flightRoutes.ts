import { Router } from 'express';
import {
  searchFlights,
  getAllFlights,
  getFlightById,
} from '../controllers/flightController';

const router = Router();

router.get('/search', searchFlights);
router.get('/', getAllFlights);
router.get('/:id', getFlightById);

export default router;
