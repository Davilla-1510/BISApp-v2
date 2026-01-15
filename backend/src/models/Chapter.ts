import mongoose, { Document, Schema } from 'mongoose';

export interface IChapter extends Document {
  level: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    level: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Veuillez fournir un titre de chapitre'],
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IChapter>('Chapter', ChapterSchema);
