import express, { Router } from 'express';
import {
adminLogin,
getProfile,
login,
signup,
updateProfile
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateLogin, validateSignup } from '../middleware/validation';

const router: Router = express.Router();

// Route publique - Inscription
router.post('/signup', validateSignup, signup);

// Route publique - Connexion
router.post('/login', validateLogin, login);

// Route admin - Connexion admin
router.post('/admin-login', adminLogin);

// Routes protégées
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
// import express, { Router } from 'express';

// import {
//     adminLogin,
//     getProfile,
//     login,
//     signup,
//     updateProfile
// } from '../controllers/authController';
// import { authenticate, authorizeAdmin } from '../middleware/auth';
// import { validateLogin, validateSignup } from '../middleware/validation';
// import { getAdminStats } from '../controllers/adminController';

// const router: Router = express.Router();

// // Route publique - Inscription
// router.post('/signup', validateSignup, signup);

// // Route publique - Connexion
// router.post('/login', validateLogin, login);

// // Route admin - Connexion admin
// router.post('/admin-login', adminLogin);

// // Routes protégées
// router.get('/profile', authenticate, getProfile);
// // Exemple de route admin protégée
// router.get('/admin/dashboard', authenticate, authorizeAdmin, getAdminStats);
// router.put('/profile', authenticate, updateProfile);

// export default router;
