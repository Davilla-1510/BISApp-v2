 import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  name: 'braille' | 'informatique';
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    name: {
      type: String,
      enum: ['braille', 'informatique'],
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IModule>('Module', ModuleSchema);
