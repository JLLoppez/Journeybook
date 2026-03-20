import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Flight } from '../models/Flight';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      flightId,
      flightData,
      passengers,
      class: flightClass,
      contactEmail,
      contactPhone,
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }
    if (!contactEmail) { res.status(400).json({ error: 'Contact email is required' }); return; }

    let flight: any = null;

    // Try to find existing flight in DB
    if (flightId) {
      flight = await Flight.findById(flightId).catch(() => null);
    }

    // If not found and flightData provided, save it to DB first
    if (!flight && flightData) {
      flight = await Flight.create({
        airline: flightData.airline,
        flightNumber: flightData.flightNumber,
        origin: flightData.origin,
        destination: flightData.destination,
        departure: flightData.departure,
        arrival: flightData.arrival,
        duration: flightData.duration,
        price: flightData.price,
        availableSeats: flightData.availableSeats || 9,
        class: flightData.class || flightClass || 'economy',
        stops: flightData.stops || 0,
        amenities: flightData.amenities || [],
      });
    }

    if (!flight) {
      res.status(404).json({ error: 'Flight not found. Please search again and retry.' });
      return;
    }

    const payingPassengers = parseInt(passengers) || 1;
    if (flight.availableSeats < payingPassengers) {
      res.status(400).json({ error: 'Not enough available seats' });
      return;
    }

    const totalPrice = flight.price * payingPassengers;
    const bookingRef = `JB${Date.now().toString(36).toUpperCase()}`;

    const booking = await Booking.create({
      user: userId,
      flight: flight._id,
      passengers: payingPassengers,
      class: flightClass || flight.class,
      totalPrice,
      status: 'confirmed',
      paymentStatus: 'pending',
      bookingReference: bookingRef,
      contactEmail,
      contactPhone,
    });

    flight.availableSeats -= payingPassengers;
    await flight.save();

    await User.findByIdAndUpdate(userId, { $push: { bookings: booking._id } });

    const populated = await Booking.findById(booking._id).populate('flight');
    res.status(201).json({ message: 'Booking confirmed', booking: populated, source: 'simulated' });

  } catch (error: any) {
    console.error('Create booking error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
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

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

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
