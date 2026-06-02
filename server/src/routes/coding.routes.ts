import { Router } from 'express';
import {
  createAssessment,
  submitCode,
  listAssessments,
  getAssessment,
} from '../controllers/coding.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';

const router = Router();

// Protect all routes
router.use(authenticateJWT);

router.post('/assessment', createAssessment);
router.get('/assessment', listAssessments);
router.get('/assessment/:id', getAssessment);
router.post('/assessment/:id/submit', submitCode);

export default router;
