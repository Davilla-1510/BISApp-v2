import mongoose, { Document, Schema } from 'mongoose';

export interface ILevel extends Document {
  module: mongoose.Types.ObjectId;
  name: 'basique' | 'moyen' | 'avance';
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema<ILevel>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    name: {
      type: String,
      enum: ['basique', 'moyen', 'avance'],
      required: true
    },
    title: {
      type: String,
      required: true
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

export default mongoose.model<ILevel>('Level', LevelSchema);
