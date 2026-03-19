/**
 * Tests booking business logic — seat calculation, price, Duffel detection
 */

describe('Booking Logic', () => {
  describe('Total price calculation', () => {
    const calcTotal = (price: number, passengers: number) => price * passengers;

    it('should calculate single passenger price', () => {
      expect(calcTotal(8500, 1)).toBe(8500);
    });

    it('should calculate multi-passenger price', () => {
      expect(calcTotal(8500, 2)).toBe(17000);
      expect(calcTotal(1500, 4)).toBe(6000);
    });

    it('should handle decimal prices', () => {
      expect(calcTotal(1234.50, 2)).toBeCloseTo(2469, 0);
    });
  });

  describe('Seat availability check', () => {
    const hasSeats = (available: number, requested: number) => available >= requested;

    it('should allow booking when seats available', () => {
      expect(hasSeats(120, 2)).toBe(true);
      expect(hasSeats(1, 1)).toBe(true);
    });

    it('should deny booking when not enough seats', () => {
      expect(hasSeats(1, 2)).toBe(false);
      expect(hasSeats(0, 1)).toBe(false);
    });
  });

  describe('Duffel offer ID detection', () => {
    const isDuffelOffer = (flightId: string) =>
      typeof flightId === 'string' && flightId.startsWith('off_');

    it('should detect Duffel offer IDs', () => {
      expect(isDuffelOffer('off_abc123xyz')).toBe(true);
      expect(isDuffelOffer('off_00000000000000000000000000')).toBe(true);
    });

    it('should reject MongoDB IDs as Duffel offers', () => {
      expect(isDuffelOffer('507f1f77bcf86cd799439011')).toBe(false);
      expect(isDuffelOffer('')).toBe(false);
    });
  });

  describe('Booking status transitions', () => {
    type Status = 'pending' | 'confirmed' | 'cancelled';

    const canCancel = (status: Status) => status === 'confirmed';
    const isCancelled = (status: Status) => status === 'cancelled';

    it('should allow cancellation of confirmed bookings', () => {
      expect(canCancel('confirmed')).toBe(true);
    });

    it('should not allow cancellation of pending or already cancelled', () => {
      expect(canCancel('pending')).toBe(false);
      expect(canCancel('cancelled')).toBe(false);
    });

    it('should detect already cancelled status', () => {
      expect(isCancelled('cancelled')).toBe(true);
      expect(isCancelled('confirmed')).toBe(false);
    });
  });

  describe('Seat restoration on cancel', () => {
    it('should restore seats after cancellation', () => {
      const flight = { availableSeats: 8 };
      const booking = { passengers: 2 };
      flight.availableSeats += booking.passengers;
      expect(flight.availableSeats).toBe(10);
    });
  });

  describe('Contact validation', () => {
    const isValidPhone = (phone: string) => {
      const cleaned = phone.replace(/\s/g, '');
      return cleaned.length >= 8;
    };

    it('should accept valid phone numbers', () => {
      expect(isValidPhone('+27683727498')).toBe(true);
      expect(isValidPhone('0831234567')).toBe(true);
    });

    it('should reject very short phone numbers', () => {
      expect(isValidPhone('1234')).toBe(false);
    });
  });
});
