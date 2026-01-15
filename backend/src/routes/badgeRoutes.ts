import { Router, Request, Response } from 'express';
import Badge from '../models/Badge';

const router = Router();

// On ajoute le "_" devant req pour indiquer à TypeScript qu'il est ignoré
router.get('/all', async (_req: Request, res: Response) => {
  try {
    const badges = await Badge.find().sort({ 'criteria.value': 1 });
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération de la liste des badges" 
    });
  }
});

export default router;