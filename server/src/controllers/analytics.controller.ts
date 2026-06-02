import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';

/**
 * Get aggregated analytics for the user's dashboard
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Fetch all user interviews
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        questions: {
          include: {
            answer: true,
          },
        },
      },
    });

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter((i) => i.score !== null);
    
    // Average score across completed interviews
    const avgScore = completedInterviews.length > 0
      ? Math.round((completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length) * 10) / 10
      : 0;

    // 2. Score trend over time (for completed interviews)
    const scoreTrend = completedInterviews.map((interview, index) => {
      const date = new Date(interview.createdAt);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        name: `Session ${index + 1}`,
        date: formattedDate,
        score: interview.score || 0,
      };
    });

    // 3. Category/Topic analysis (average score for HR, Technical, Project, Behavioral)
    const categoryScores: { [key: string]: { total: number; count: number } } = {
      HR: { total: 0, count: 0 },
      Technical: { total: 0, count: 0 },
      Project: { total: 0, count: 0 },
      Behavioral: { total: 0, count: 0 },
    };

    let totalQuestionsAnswered = 0;

    interviews.forEach((interview) => {
      interview.questions.forEach((q) => {
        if (q.answer) {
          totalQuestionsAnswered++;
          const type = q.type;
          if (categoryScores[type] !== undefined) {
            categoryScores[type].total += q.answer.score;
            categoryScores[type].count += 1;
          }
        }
      });
    });

    const topicStats = Object.keys(categoryScores).map((key) => {
      const stats = categoryScores[key];
      return {
        topic: key === 'Technical' ? 'Technical' : key === 'Project' ? 'Project-Based' : key === 'Behavioral' ? 'Behavioral' : 'HR Fit',
        score: stats.count > 0 ? Math.round((stats.total / stats.count) * 10) / 10 : 0,
        count: stats.count,
      };
    });

    // 4. Resume check
    const resumesCount = await prisma.resume.count({
      where: { userId },
    });

    return res.status(200).json({
      stats: {
        totalInterviews,
        completedInterviews: completedInterviews.length,
        avgScore,
        totalAnswers: totalQuestionsAnswered,
        hasResume: resumesCount > 0,
      },
      scoreTrend,
      topicStats,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ message: 'Failed to aggregate analytics data' });
  }
};
