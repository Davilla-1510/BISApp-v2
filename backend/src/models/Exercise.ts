import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  lesson: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'text' | 'multiple-choice' | 'braille-conversion' | 'matching';
  question: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  brailleText?: string;
  order: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'braille-conversion', 'matching'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: [
      {
        text: String,
        isCorrect: Boolean
      }
    ],
    correctAnswer: String,
    brailleText: String,
    order: {
      type: Number,
      required: true
    },
    maxAttempts: {
      type: Number,
      default: 3,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
