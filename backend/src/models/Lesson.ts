import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  chapter: mongoose.Types.ObjectId;
  title: string;
  content: string;
  order: number;
  audioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Veuillez fournir un titre de leçon'],
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    audioUrl: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model<ILesson>('Lesson', LessonSchema);
