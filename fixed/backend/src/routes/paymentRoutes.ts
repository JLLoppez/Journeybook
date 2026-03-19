import { Router } from 'express';
import express from 'express';
import { createPaymentIntent, confirmPayment, stripeWebhook } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);

export default router;
