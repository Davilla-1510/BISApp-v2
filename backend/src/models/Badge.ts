import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'quiz_score' | 'lessons_count' | 'streak' | 'lessons_completed' | 'badges_earned' | 'level_complete' | 'perfect_scores';
    value: number;
    levelId?: mongoose.Types.ObjectId;
  };
}

const BadgeSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'award' },
  criteria: {
    type: { type: String, enum: ['quiz_score', 'lessons_count', 'streak', 'lessons_completed', 'badges_earned', 'level_complete', 'perfect_scores'], required: true },
    value: { type: Number, required: true },
    levelId: { type: Schema.Types.ObjectId, ref: 'Level' }
  }
});

export default mongoose.model<IBadge>('Badge', BadgeSchema);
