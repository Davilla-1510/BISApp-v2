import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: { id: string; role: "student" | "admin" };
}


const JWT_SECRET = process.env.JWT_SECRET || 'braille-tutor-secret-key-2026';

const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const formatUserResponse = (user: any) => ({
  id: user._id.toString(),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  accessibilityLevel: user.accessibilityLevel,
  audioMode: user.audioMode,
  role: user.role,
  subscriptionStatus: user.subscriptionStatus,
  createdAt: user.createdAt
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, accessibilityLevel, audioMode } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: 'Tous les champs sont requis' });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    // Créer l'utilisateur
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      accessibilityLevel: accessibilityLevel || 'no-visual-impairment',
      audioMode: audioMode || false,
      role: 'student',
      subscriptionStatus: 'free'
    });

    // Générer un token
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Erreur signup:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email et mot de passe requis' });
      return;
    }

    // Chercher l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    // Générer un token
    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, adminSecret } = req.body;

    if (!email || !password || !adminSecret) {
      res.status(400).json({ message: 'Tous les champs sont requis' });
      return;
    }

    // Vérifier la clé secrète admin
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      res.status(401).json({ message: 'Secret administrateur invalide' });
      return;
    }

    // Chercher l'utilisateur avec rôle admin
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Administrateur non trouvé' });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Identifiants invalides' });
      return;
    }

    // Générer un token
    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Erreur adminLogin:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion admin' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    res.status(200).json({
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Non authentifie' });
      return;
    }

    const { audioMode, accessibilityLevel, profilePhoto, bio } = req.body;
    const updateData: Record<string, any> = {};

    if (audioMode !== undefined) updateData.audioMode = audioMode;
    if (accessibilityLevel !== undefined) updateData.accessibilityLevel = accessibilityLevel;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: 'Utilisateur non trouve' });
      return;
    }

    res.status(200).json({
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ message: 'Erreur lors de la mise a jour du profil' });
  }
};
