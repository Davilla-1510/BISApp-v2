// Role de ce middleware est de valider les données d'entrée pour les routes d'authentification
// signup et login.

import { NextFunction, Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

export const validateSignup = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { firstName, lastName, email, password, confirmPassword, accessibilityLevel } = req.body;

  if (!firstName || firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'Le prénom est requis' });
  }

  if (!lastName || lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Le nom est requis' });
  }

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: "L'email est requis" });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push({ field: 'email', message: 'Email invalide' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Le mot de passe est requis' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Le mot de passe doit contenir au moins 6 caractères' });
  } else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}/.test(password)) {
    errors.push({ field: 'password', message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial' });
  }

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Les mots de passe ne correspondent pas' });
  }

  if (!['no-visual-impairment', 'partial', 'total'].includes(accessibilityLevel)) {
    errors.push({ field: 'accessibilityLevel', message: 'Niveau d\'accessibilité invalide' });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { email, password } = req.body;

  if (!email) {
    errors.push({ field: 'email', message: "L'email est requis" });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Le mot de passe est requis' });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
