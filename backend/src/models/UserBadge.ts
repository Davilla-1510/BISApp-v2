import mongoose, { Schema } from 'mongoose';

const UserBadgeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now }
});

// Empêcher les doublons : un utilisateur ne peut avoir le même badge qu'une seule fois
UserBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export default mongoose.model('UserBadge', UserBadgeSchema);