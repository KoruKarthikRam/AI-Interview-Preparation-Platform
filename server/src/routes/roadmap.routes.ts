import { Router } from 'express';
import {
  createRoadmap,
  listRoadmaps,
  getRoadmap,
} from '../controllers/roadmap.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';

const router = Router();

// Protect all routes
router.use(authenticateJWT);

router.post('/', createRoadmap);
router.get('/', listRoadmaps);
router.get('/:id', getRoadmap);

export default router;
