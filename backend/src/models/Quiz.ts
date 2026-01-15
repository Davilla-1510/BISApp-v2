import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  level: mongoose.Types.ObjectId;
  title: string;
  description: string;
  exercises: mongoose.Types.ObjectId[];
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    level: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    exercises: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Exercise'
      }
    ],
    passingScore: {
      type: Number,
      default: 70,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
