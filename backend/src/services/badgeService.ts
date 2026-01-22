import Badge from '../models/Badge';
import UserBadge from '../models/UserBadge';

export const checkAndAwardBadges = async (userId: string, levelId: string, score: number) => {
  try {
    // 1. Chercher les badges liés à ce niveau dont le score est atteint
    const eligibleBadges = await Badge.find({
      'criteria.levelId': levelId,
      'criteria.type': 'quiz_score',
      'criteria.value': { $lte: score }
    });

    for (const badge of eligibleBadges) {
      try {
        // 2. Tenter d'attribuer le badge (l'index unique empêche les doublons)
        await UserBadge.create({
          user: userId,
          badge: badge._id
        });
        console.log(`🏅 Badge "${badge.name}" attribué à l'utilisateur ${userId}`);
      } catch (err) {
        // L'erreur ici signifie simplement que l'utilisateur a déjà le badge
      }
    }
  } catch (error) {
    console.error('Erreur lors de l’attribution des badges:', error);
  }
};
