import { Router } from 'express';
import { uploadResume, getLatestResume, getResumeById } from '../controllers/resume.controller';
import { authenticateJWT } from '../middleware/jwt.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Protect all routes here
router.use(authenticateJWT);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/latest', getLatestResume);
router.get('/:id', getResumeById);

export default router;
