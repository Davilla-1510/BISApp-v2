import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId;
  module?: mongoose.Types.ObjectId;
  level?: mongoose.Types.ObjectId;
  chapter?: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  exercise?: mongoose.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed' | 'passed';
  attempts: number;
  score?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module'
    },
    level: {
      type: Schema.Types.ObjectId,
      ref: 'Level'
    },
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter'
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    exercise: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'passed'],
      default: 'not-started'
    },
    attempts: {
      type: Number,
      default: 0
    },
    score: {
      type: Number
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index compound pour optimiser les requêtes
UserProgressSchema.index({ user: 1, module: 1 });
UserProgressSchema.index({ user: 1, level: 1 });
UserProgressSchema.index({ user: 1, lesson: 1 });
UserProgressSchema.index({ user: 1, exercise: 1 });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
