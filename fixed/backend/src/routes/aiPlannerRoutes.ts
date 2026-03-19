import { Router } from 'express';
import { generateTravelPlan } from '../controllers/aiPlannerController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Authenticated users only – prevent abuse
router.post('/plan', authenticate, generateTravelPlan);

export default router;
