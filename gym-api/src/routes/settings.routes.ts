import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rotas de configurações da academia
router.get('/gym-settings', authenticateToken, SettingsController.getGymSettings);
router.put('/gym-settings', authenticateToken, SettingsController.updateGymSettings);

// Rota de mudança de senha removida temporariamente

export { router as settingsRoutes };
