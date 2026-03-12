import { Response } from 'express';
import axios from 'axios';
import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const DUFFEL_BASE = 'https://api.duffel.com';

function duffelClient() {
  const key = process.env.DUFFEL_API_KEY;
  if (!key || key === 'your_duffel_api_key_here') return null;
  return axios.create({
    baseURL: DUFFEL_BASE,
    headers: {
      Authorization: `Bearer ${key}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    timeout: 20000,
  });
}

// ─── Create booking (with optional Duffel order) ───────────────────────────────
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      flightId,          // Duffel offer ID (off_...) or MongoDB _id
      duffelOfferId,     // explicitly passed when booking a live offer
      passengers,
      class: flightClass,
      contactEmail,
      contactPhone,
      // Duffel passenger details (required for real booking)
      passengerDetails,  // { givenName, familyName, bornOn, gender, title }
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

    const offerId = duffelOfferId || (typeof flightId === 'string' && flightId.startsWith('off_') ? flightId : null);

    // ── Option A: Real Duffel booking ─────────────────────────────────────────
    if (offerId) {
      const client = duffelClient();
      if (!client) {
        res.status(503).json({ error: 'Duffel API not configured. Add DUFFEL_API_KEY to .env' });
        return;
      }

      // 1. Refresh offer to get latest price + passenger IDs
      const { data: offerData } = await client.get(`/air/offers/${offerId}`);
      const offer = offerData?.data;
      if (!offer) { res.status(404).json({ error: 'Duffel offer not found or expired' }); return; }

      const offerPassengers = offer.passengers || [];
      const totalAmount = offer.total_amount;
      const totalCurrency = offer.total_currency;

      // 2. Build passenger payload (map our form data to Duffel's schema)
      const pd = passengerDetails || {};
      const duffelPassengers = offerPassengers.map((p: any) => ({
        id: p.id,
        title: pd.title || 'mr',
        gender: pd.gender || 'm',
        given_name: pd.givenName || contactEmail.split('@')[0],
        family_name: pd.familyName || 'Traveller',
        born_on: pd.bornOn || '1990-01-01',
        email: contactEmail,
        phone_number: contactPhone?.replace(/\s/g, '') || '+27000000000',
      }));

      // 3. Create Duffel order (uses Duffel Balance in test mode)
      const { data: orderData } = await client.post('/air/orders', {
        data: {
          selected_offers: [offerId],
          passengers: duffelPassengers,
          payments: [{ type: 'balance', currency: totalCurrency, amount: totalAmount }],
        },
      });

      const order = orderData?.data;
      const bookingRef = order?.booking_reference || `JB${Date.now().toString(36).toUpperCase()}`;

      // 4. Save to our DB for dashboard
      const booking = await Booking.create({
        user: userId,
        flight: null,                       // no local flight doc for live offers
        duffelOrderId: order?.id,
        duffelOfferId: offerId,
        passengers: parseInt(passengers) || 1,
        class: flightClass || 'economy',
        totalPrice: parseFloat(totalAmount),
        originalCurrency: totalCurrency,
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: 'duffel_balance',
        bookingReference: bookingRef,
        contactEmail,
        contactPhone,
        duffelOrderSnapshot: {
          airline: offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.name,
          origin: offer.slices?.[0]?.origin?.iata_code,
          destination: offer.slices?.[0]?.destination?.iata_code,
          departureAt: offer.slices?.[0]?.segments?.[0]?.departing_at,
        },
      });

      await User.findByIdAndUpdate(userId, { $push: { bookings: booking._id } });
      res.status(201).json({ message: 'Booking confirmed via Duffel', booking, duffelOrder: order, source: 'duffel' });
      return;
    }

    // ── Option B: Local MongoDB flight (seeded data / demo) ───────────────────
    const flight = await Flight.findById(flightId);
    if (!flight) { res.status(404).json({ error: 'Flight not found' }); return; }
    if (flight.availableSeats < (passengers || 1)) {
      res.status(400).json({ error: 'Not enough available seats' });
      return;
    }

    const totalPrice = flight.price * (parseInt(passengers) || 1);
    const booking = await Booking.create({
      user: userId,
      flight: flightId,
      passengers: parseInt(passengers) || 1,
      class: flightClass || flight.class,
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'pending',
      contactEmail,
      contactPhone,
    });

    flight.availableSeats -= parseInt(passengers) || 1;
    await flight.save();
    await User.findByIdAndUpdate(userId, { $push: { bookings: booking._id } });

    const populated = await Booking.findById(booking._id).populate('flight');
    res.status(201).json({ message: 'Booking created', booking: populated, source: 'database' });
  } catch (error: any) {
    console.error('Create booking error:', error?.response?.data || error.message);
    const duffelError = error?.response?.data?.errors?.[0]?.message;
    res.status(500).json({ error: duffelError || error.message || 'Failed to create booking' });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?.userId })
      .populate('flight')
      .sort({ createdAt: -1 });
    res.json({ count: bookings.length, bookings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user?.userId }).populate('flight');
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json({ booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user?.userId });
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    if (booking.status === 'cancelled') { res.status(400).json({ error: 'Already cancelled' }); return; }

    // If it's a Duffel order, cancel via Duffel too
    const duffelOrderId = (booking as any).duffelOrderId;
    if (duffelOrderId) {
      const client = duffelClient();
      if (client) {
        try {
          // Check cancellation eligibility first
          const { data: cancelData } = await client.post(`/air/order_cancellations`, {
            data: { order_id: duffelOrderId },
          });
          const cancellationId = cancelData?.data?.id;
          if (cancellationId) {
            await client.post(`/air/order_cancellations/${cancellationId}/actions/confirm`);
          }
        } catch (duffelErr: any) {
          console.error('Duffel cancellation error:', duffelErr?.response?.data);
          // Don't block — still mark as cancelled locally
        }
      }
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Restore seats for local flights
    if (booking.flight) {
      const flight = await Flight.findById(booking.flight);
      if (flight) { flight.availableSeats += booking.passengers; await flight.save(); }
    }

    res.json({ message: 'Booking cancelled', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, itinerary } = req.body;
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, user: req.user?.userId },
      { savedItinerary: itinerary },
      { new: true }
    );
    if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
    res.json({ message: 'Itinerary saved', booking });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
