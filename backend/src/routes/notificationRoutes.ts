import express, { Router, Request, Response } from 'express';
import User from '../models/User';
import Notification, { NotificationType, NotificationStatus } from '../models/Notification';
import { sendEmail, sendCustomEmail, EmailType } from '../services/emailService';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router: Router = express.Router();

// Toutes les routes nécessitent l'authentification et le rôle admin
router.use(authenticate, authorizeAdmin);

/**
 * POST /api/notifications/send-all
 * Envoyer une notification à tous les utilisateurs
 */
router.post('/send-all', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir un sujet et un message' 
      });
      return;
    }

    // Récupérer tous les utilisateurs
    const users = await User.find({ role: 'student' }).select('firstName email');
    
    if (users.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Aucun utilisateur trouvé' 
      });
      return;
    }

    // Envoyer les emails en parallèle
    const results = await Promise.allSettled(
      users.map(user => 
        sendCustomEmail(user.email, subject, `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1>📢 BISApp - Notification</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
              <p>Bonjour ${user.firstName},</p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px;">
                © 2024 BISApp - Équipe Administrative
              </p>
            </div>
          </div>
        `)
      )
    );

    // Compter les résultats
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.length - successCount;

    // Créer des notifications dans la base de données
    await Notification.insertMany(
      users.map(user => ({
        user: user._id,
        type: NotificationType.ADMIN_MESSAGE,
        title: subject,
        message,
        status: NotificationStatus.SENT,
        emailSent: true,
        sentAt: new Date()
      }))
    );

    res.status(200).json({
      success: true,
      message: `Notification envoyée à ${successCount} utilisateur(s)`,
      stats: {
        total: users.length,
        success: successCount,
        failed: failedCount
      }
    });
  } catch (error) {
    console.error('Erreur envoi notification全体:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi des notifications' 
    });
  }
});

/**
 * POST /api/notifications/send-to-user
 * Envoyer une notification à un utilisateur spécifique
 */
router.post('/send-to-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir userId, sujet et message' 
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
      return;
    }

    const emailSent = await sendCustomEmail(user.email, subject, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📢 Message BISApp</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
          <p>Bonjour ${user.firstName},</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px;">
            © 2026 BISApp
          </p>
        </div>
      </div>
    `);

    if (emailSent) {
      await Notification.create({
        user: user._id,
        type: NotificationType.ADMIN_MESSAGE,
        title: subject,
        message,
        status: NotificationStatus.SENT,
        emailSent: true,
        sentAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: `Notification envoyée à ${user.email}`
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Échec de l\'envoi de l\'email' 
      });
    }
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de la notification' 
    });
  }
});

/**
 * GET /api/notifications
 * Liste des notifications (pour l'admin)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments();

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des notifications' 
    });
  }
});

/**
 * GET /api/notifications/user/:userId
 * Notifications d'un utilisateur spécifique
 */
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur récupération notifications utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des notifications' 
    });
  }
});

/**
 * POST /api/notifications/test-email
 * Tester l'envoi d'email (pour l'admin)
 */
router.post('/test-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ 
        success: false, 
        message: 'Veuillez fournir une adresse email' 
      });
      return;
    }

    const testSent = await sendEmail(email, EmailType.WELCOME, 'Test User');

    if (testSent) {
      res.status(200).json({
        success: true,
        message: 'Email de test envoyé avec succès'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Échec de l\'envoi de l\'email de test. Vérifiez la configuration SMTP.' 
      });
    }
  } catch (error) {
    console.error('Erreur test email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'envoi de l\'email de test' 
    });
  }
});

export default router;

