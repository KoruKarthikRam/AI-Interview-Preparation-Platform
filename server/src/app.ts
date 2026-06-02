import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import interviewRoutes from './routes/interview.routes';
import analyticsRoutes from './routes/analytics.routes';
import leetCodeRoutes from './routes/leetcode.routes';
import codingRoutes from './routes/coding.routes';
import roadmapRoutes from './routes/roadmap.routes';

// Load environment variables
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend client
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Express JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'AI Interview Prep API is running smoothly' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leetcode', leetCodeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err.message || err);
  res.status(500).json({
    message: err.message || 'An unexpected server error occurred',
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});

export default app;
