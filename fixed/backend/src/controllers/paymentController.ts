import { Response } from 'express';
import Stripe from 'stripe';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2024-06-20' });

// Create a Stripe PaymentIntent for a booking
export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.userId;

    if (!process.env.STRIPE_SECRET_KEY) { res.status(503).json({ error: 'Stripe is not configured' }); return; }

    const booking = await Booking.findOne({ _id: bookingId, user: userId }).populate('flight');
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    if (booking.paymentStatus === 'completed') { res.status(400).json({ error: 'Already paid' }); return; }

    const amountCents = Math.round(booking.totalPrice * 100); // ZAR cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'zar',
      metadata: { bookingId: booking._id.toString(), userId: userId || '' },
      description: `JourneyBook – ${booking.bookingReference}`,
    });

    res.json({ clientSecret: paymentIntent.client_secret, bookingReference: booking.bookingReference, amount: booking.totalPrice });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message || 'Payment setup failed' });
  }
};

// Confirm payment after Stripe processes it (webhook or manual confirm)
export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    const userId = req.user?.userId;

    // In production, verify via webhook. Here we verify directly.
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') { res.status(400).json({ error: 'Payment not succeeded' }); return; }

    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, user: userId },
      { paymentStatus: 'completed', status: 'confirmed', paymentMethod: 'stripe', paymentIntentId },
      { new: true }
    ).populate('flight');

    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json({ message: 'Payment confirmed', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Stripe webhook handler
export const stripeWebhook = async (req: any, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY) { res.status(503).json({ error: 'Stripe is not configured' }); return; }
  if (!webhookSecret) { res.json({ received: true }); return; }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature error:', err);
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const bookingId = pi.metadata?.bookingId;
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'completed', status: 'confirmed' });
    }
  }

  res.json({ received: true });
};
