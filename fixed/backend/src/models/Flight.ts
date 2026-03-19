import mongoose, { Document, Schema } from 'mongoose';

export interface IFlight extends Document {
  _id: mongoose.Types.ObjectId;
  airline: string;
  flightNumber: string;
  origin: {
    city: string;
    airport: string;
    code: string;
  };
  destination: {
    city: string;
    airport: string;
    code: string;
  };
  departure: {
    date: Date;
    time: string;
  };
  arrival: {
    date: Date;
    time: string;
  };
  duration: string;
  price: number;
  availableSeats: number;
  class: 'economy' | 'business' | 'first';
  amenities: string[];
  stops: number;
  createdAt: Date;
  updatedAt: Date;
}

const flightSchema = new Schema<IFlight>(
  {
    airline: {
      type: String,
      required: [true, 'Airline is required'],
      trim: true
    },
    flightNumber: {
      type: String,
      required: [true, 'Flight number is required'],
      trim: true,
      uppercase: true
    },
    origin: {
      city: {
        type: String,
        required: true,
        trim: true
      },
      airport: {
        type: String,
        required: true,
        trim: true
      },
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      }
    },
    destination: {
      city: {
        type: String,
        required: true,
        trim: true
      },
      airport: {
        type: String,
        required: true,
        trim: true
      },
      code: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3
      }
    },
    departure: {
      date: {
        type: Date,
        required: true
      },
      time: {
        type: String,
        required: true
      }
    },
    arrival: {
      date: {
        type: Date,
        required: true
      },
      time: {
        type: String,
        required: true
      }
    },
    duration: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative']
    },
    class: {
      type: String,
      enum: ['economy', 'business', 'first'],
      default: 'economy'
    },
    amenities: [{
      type: String
    }],
    stops: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient searching
flightSchema.index({ 'origin.code': 1, 'destination.code': 1, 'departure.date': 1 });
flightSchema.index({ price: 1 });
flightSchema.index({ airline: 1 });

export const Flight = mongoose.model<IFlight>('Flight', flightSchema);
