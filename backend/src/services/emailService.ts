import nodemailer from 'nodemailer';

// Configuration du transporteur email avec Gmail
// Note: Pour Gmail, il faut activer "Less secure app access" ou utiliser un App Password
const createTransporter = () => {
  const gmailEmail = process.env.GMAIL_EMAIL;
  const gmailPassword = process.env.GMAIL_PASSWORD;

  if (!gmailEmail || !gmailPassword) {
    console.warn('⚠️ Email non configuré: GMAIL_EMAIL et GMAIL_PASSWORD non définis');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailPassword, // Utiliser un App Password si 2FA activé
    },
  });
};

const transporter = createTransporter();

// Types d'emails
export enum EmailType {
  WELCOME = 'welcome',
  INACTIVITY_REMINDER = 'inactivity_reminder',
  ADMIN_NOTIFICATION = 'admin_notification',
  PROGRESS_UPDATE = 'progress_update',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

// Templates d'emails
const emailTemplates = {
  [EmailType.WELCOME]: {
    subject: 'Bienvenue sur BISApp! 🎓',
    html: (firstName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Bienvenue sur BISApp!</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName}!</h2>
            <p>Nous sommes ravis de vous accueillir sur <strong>BISApp</strong>, votre plateforme d'apprentissage du Braille et de l'informatique accessible.</p>
            <p>Avec BISApp, vous pourrez :</p>
            <ul>
              <li>📚 Apprendre le Braille à votre rythme</li>
              <li>💻 Découvrir l'informatique accessible</li>
              <li>🏆 Gagner des badges en progressant</li>
              <li>♿ Profiter d'une accessibilité totale</li>
            </ul>
            <a href="#" class="button">Commencer l'apprentissage</a>
          </div>
          <div class="footer">
            <p>© 2024 BISApp - Apprendre le Braille et l'Informatique Accessible</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  [EmailType.INACTIVITY_REMINDER]: {
    subject: 'On vous attend sur BISApp! 📚',
    html: (firstName: string, extraData?: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .streak { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 On vous a manqué!</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName}!</h2>
            <p>Cela fait <strong>24 heures</strong> que vous n'avez pas utilisé BISApp. Votre streak est en jeu!</p>
            <div class="streak">
              <p style="margin: 0; font-size: 18px;">🔥 Continuez votre apprentissage</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Le Braille n'attend plus que vous!</p>
            </div>
            <p>Vos dernières leçons incomplètes vous attendent. Reprenez où vous vous êtes arrêté!</p>
            <a href="#" class="button">Reprendre l'apprentissage</a>
          </div>
          <div class="footer">
            <p>💡Conseil: Essayez de consacrer 15 minutes par jour au Braille!</p>
            <p>© 2026 BISApp</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  [EmailType.ADMIN_NOTIFICATION]: {
    subject: '📢 Notification de BISApp',
    html: (firstName: string, message: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6366F1; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Message de l'équipe BISApp</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <div class="message-box">
              <p>${message}</p>
            </div>
            <p>Merci de votre attention et bonne continuation sur BISApp!</p>
          </div>
          <div class="footer">
            <p>© 2026 BISApp - Équipe Administrative</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  [EmailType.PROGRESS_UPDATE]: {
    subject: 'Votre progression BISApp 📊',
    html: (firstName: string, stats: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #34D399); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #6366F1; }
          .stat-label { font-size: 12px; color: #6b7280; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Votre progression</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName},</h2>
            <p>Voici un aperçu de votre progression sur BISApp:</p>
            <div class="stats">
              ${stats}
            </div>
            <p>Continuez comme ça! 🎉</p>
          </div>
          <div class="footer">
            <p>© 2026 BISApp</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  [EmailType.ACHIEVEMENT_UNLOCKED]: {
    subject: '🎉 Nouveau badge débloqué!',
    html: (firstName: string, badgeName: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #FBBF24); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9fafb; border-radius: 10px; margin-top: 20px; text-align: center; }
          .badge { font-size: 60px; margin: 20px 0; }
          .button { display: inline-block; background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Félicitations!</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${firstName}!</h2>
            <div class="badge">🏆</div>
            <p>Vous avez débloqué un nouveau badge:</p>
            <h3 style="color: #F59E0B;">${badgeName}</h3>
            <p>Continuez à apprendre pour débloquer encore plus de badges!</p>
            <a href="#" class="button">Voir mes badges</a>
          </div>
          <div class="footer">
            <p>© 2026 BISApp</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// Fonction principale d'envoi d'email
export const sendEmail = async (
  to: string,
  type: EmailType,
  firstName: string,
  extraData?: string
): Promise<boolean> => {
  if (!transporter) {
    console.warn('⚠️ Email non configuré, envoi ignoré');
    return false;
  }

  const template = emailTemplates[type];
  if (!template) {
    console.error('❌ Template email non trouvé:', type);
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"BISApp" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject: template.subject,
      html: template.html(firstName, extraData || ''),
    });

    console.log(` Email ${type} envoyé à ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

// Fonction pour envoyer un email personnalisé (admin)
export const sendCustomEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<boolean> => {
  if (!transporter) {
    console.warn('⚠️ Email non configuré, envoi ignoré');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"BISApp - Administration" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(` Email personnalisé envoyé à ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email personnalisé:', error);
    return false;
  }
};

export default {
  sendEmail,
  sendCustomEmail,
  EmailType,
};

