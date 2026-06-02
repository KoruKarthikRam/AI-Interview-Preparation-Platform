import { Router } from 'express';
import {
  createInterview,
  getInterview,
  submitAnswer,
  completeInterview,
  listInterviews,
} from '../controllers/interview.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';

const router = Router();

// Protect all routes
router.use(authenticateJWT);

router.post('/', createInterview);
router.get('/', listInterviews);
router.get('/:id', getInterview);
router.post('/:interviewId/question/:questionId/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

export default router;
