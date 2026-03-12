import cron from 'node-cron';
import User, { IUser } from '../models/User';
import UserProgress from '../models/UserProgress';
import Notification, { NotificationType, NotificationStatus } from '../models/Notification';
import { sendEmail, EmailType } from './emailService';

// Configuration: heures d'inactivité avant rappel
const INACTIVITY_HOURS = 24;

// Variable pour suivre si le cron est démarré
let cronJobStarted = false;

/**
 * Trouve les utilisateurs inactifs depuis plus de X heures
 */
export const findInactiveUsers = async (hoursInactive: number = INACTIVITY_HOURS): Promise<IUser[]> => {
  const cutoffTime = new Date(Date.now() - hoursInactive * 60 * 60 * 1000);
  
  // Trouver les utilisateurs qui n'ont pas de progression récente
  const usersWithRecentActivity = await UserProgress.distinct('user', {
    updatedAt: { $gte: cutoffTime }
  });
  
  // Trouver tous les utilisateurs sauf ceux avec activité récente
  const inactiveUsers = await User.find({
    _id: { $nin: usersWithRecentActivity },
    role: 'student', // Ne pas inclure les admins
    createdAt: { $lt: cutoffTime } // Utilisateurs créés avant le cutoff
  }).select('firstName lastName email');
  
  return inactiveUsers;
};

/**
 * Envoie un email de rappel d'inactivité à un utilisateur
 */
export const sendInactivityReminder = async (user: IUser): Promise<boolean> => {
  try {
    // Envoyer l'email
    const emailSent = await sendEmail(
      user.email,
      EmailType.INACTIVITY_REMINDER,
      user.firstName
    );
    
    // Créer une notification dans la base de données
    if (emailSent) {
      await Notification.create({
        user: user._id,
        type: NotificationType.INACTIVITY_REMINDER,
        title: 'Rappel: Continuez votre apprentissage!',
        message: `Cela fait ${INACTIVITY_HOURS} heures que vous n'avez pas utilisé l'application.`,
        status: NotificationStatus.SENT,
        emailSent: true,
        emailSentAt: new Date(),
        sentAt: new Date()
      });
      
      console.log(` Rappel d'inactivité envoyé à ${user.email}`);
    }
    
    return emailSent;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi du rappel à ${user.email}:`, error);
    
    // Créer une notification d'échec
    await Notification.create({
      user: user._id,
      type: NotificationType.INACTIVITY_REMINDER,
      title: 'Rappel échoué',
      message: `Échec de l'envoi du rappel d'inactivité`,
      status: NotificationStatus.FAILED,
      emailSent: false
    });
    
    return false;
  }
};

/**
 * Tâche principale: vérifier les utilisateurs inactifs et envoyer des rappels
 */
export const processInactiveUsers = async (): Promise<void> => {
  console.log('🔍 Vérification des utilisateurs inactifs...');
  
  try {
    const inactiveUsers = await findInactiveUsers(INACTIVITY_HOURS);
    
    if (inactiveUsers.length === 0) {
      console.log(' Aucun utilisateur inactif trouvé');
      return;
    }
    
    console.log(` ${inactiveUsers.length} utilisateur(s) inactif(s) trouvé(s)`);
    
    // Envoyer les rappels en parallèle
    const results = await Promise.allSettled(
      inactiveUsers.map(user => sendInactivityReminder(user))
    );
    
    // Compter les succès et échecs
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failedCount = results.length - successCount;
    
    console.log(`📊 Résultats: ${successCount} réussi(s), ${failedCount} échoué(s)`);
  } catch (error) {
    console.error('❌ Erreur lors du traitement des utilisateurs inactifs:', error);
  }
};

/**
 * Met à jour la date de dernière activité d'un utilisateur
 */
export const updateUserActivity = async (userId: string): Promise<void> => {
  try {
    // Cette fonction peut être utilisée pour tracker l'activité
    // On pourrait ajouter un champ lastActivityAt au modèle User
    console.log(`👤 Activité mise à jour pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error('Erreur mise à jour activité:', error);
  }
};

/**
 * Crée une notification pour un utilisateur
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<void> => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      status: NotificationStatus.PENDING
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
};

/**
 * Démarre le cron job pour les rappels d'inactivité
 * s'exécute toutes les heures pour vérifier les utilisateurs inactifs
 */
export const startInactivityCronJob = (): void => {
  if (cronJobStarted) {
    console.log('⚠️ Le cron job d\'inactivité est déjà démarré');
    return;
  }
  
  // S'exécute toutes les heures (à la minute 0)
  cron.schedule('0 * * * *', async () => {
    console.log('\n⏰ Début de la vérification d\'inactivité...');
    await processInactiveUsers();
    console.log('⏸️ Fin de la vérification d\'inactivité\n');
  });
  
  cronJobStarted = true;
  console.log(' Cron job d\'inactivité démarré (s\'exécute toutes les heures)');
};

/**
 * Arrête le cron job
 */
export const stopInactivityCronJob = (): void => {
  // Note: node-cron ne fournit pas de méthode stop(), 
  // il faudrait utiliser une autre approche pour arrêter complètement
  console.log('ℹ️ Pour arrêter le cron job, redémarrez le serveur');
};

/**
 * Fonction de test: envoie un rappel manuel à un utilisateur
 */
export const testInactivityReminder = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return false;
    }
    
    return await sendInactivityReminder(user);
  } catch (error) {
    console.error('❌ Erreur test rappel:', error);
    return false;
  }
};

export default {
  findInactiveUsers,
  sendInactivityReminder,
  processInactiveUsers,
  updateUserActivity,
  createNotification,
  startInactivityCronJob,
  stopInactivityCronJob,
  testInactivityReminder
};

