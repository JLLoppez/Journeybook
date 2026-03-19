import { Router } from 'express';
import { createBooking, getUserBookings, getBookingById, cancelBooking, saveItinerary } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);
router.post('/save-itinerary', saveItinerary);

export default router;
