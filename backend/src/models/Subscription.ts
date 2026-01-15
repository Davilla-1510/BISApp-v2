import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'pending';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
