import mongoose, { Document, Schema } from 'mongoose';

// Types de notifications
export enum NotificationType {
  INACTIVITY_REMINDER = 'inactivity_reminder',
  ADMIN_MESSAGE = 'admin_message',
  PROGRESS_UPDATE = 'progress_update',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
}

// Statut de la notification
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read',
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  scheduledFor?: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NotificationType,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: NotificationStatus,
      default: NotificationStatus.PENDING,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps:true }
);

// Index pour optimiser les requêtes
NotificationSchema.index({ user: 1, status: 1 });
NotificationSchema.index({ scheduledFor: 1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

