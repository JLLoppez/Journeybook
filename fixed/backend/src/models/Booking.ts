import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  flight?: mongoose.Types.ObjectId;       // local flight (seeded data)
  duffelOfferId?: string;                  // Duffel offer used
  duffelOrderId?: string;                  // Duffel order reference
  duffelOrderSnapshot?: object;           // snapshot of key flight info from Duffel
  passengers: number;
  class: string;
  totalPrice: number;
  originalCurrency?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentIntentId?: string;
  bookingReference: string;
  contactEmail: string;
  contactPhone: string;
  savedItinerary?: object;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: Schema.Types.ObjectId, ref: 'Flight', default: null },
    duffelOfferId: { type: String },
    duffelOrderId: { type: String },
    duffelOrderSnapshot: { type: Object },
    passengers: { type: Number, required: true, min: 1 },
    class: { type: String, default: 'economy' },
    totalPrice: { type: Number, required: true, min: 0 },
    originalCurrency: { type: String, default: 'ZAR' },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, default: 'pending' },
    paymentIntentId: { type: String },
    bookingReference: { type: String, unique: true, uppercase: true },
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String, required: true },
    savedItinerary: { type: Object },
  },
  { timestamps: true }
);

bookingSchema.pre('save', async function (next) {
  if (!this.bookingReference) {
    this.bookingReference = `JB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});

bookingSchema.index({ user: 1 });
bookingSchema.index({ duffelOrderId: 1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
