import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';
import { generateLeetCodeProblem, evaluateLeetCodeApproach } from '../services/gemini.service';

/**
 * Create a new LeetCode Interview session
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { topics, difficulty } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!topics || !Array.isArray(topics) || topics.length === 0 || !difficulty) {
    return res.status(400).json({ message: 'Topics (array) and difficulty are required' });
  }

  try {
    // Generate problem from Gemini
    const problem = await generateLeetCodeProblem(topics, difficulty);

    // Format description markdown
    const problemDescription = `
${problem.description}

### Examples
${problem.examples.map(ex => `\`\`\`\n${ex}\n\`\`\``).join('\n\n')}

### Constraints
${problem.constraints.map((c) => `- ${c}`).join('\n')}
`;

    const session = await prisma.leetCodeSession.create({
      data: {
        userId,
        topics: JSON.stringify(topics),
        difficulty,
        problemTitle: problem.title,
        problemDescription,
      },
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error creating LeetCode session:', error);
    return res.status(500).json({ message: 'Failed to generate problem. Please try again.' });
  }
};

/**
 * Submit approach explanation & evaluate
 */
export const submitExplanation = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { explanation } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (explanation === undefined || explanation.trim() === '') {
    return res.status(400).json({ message: 'Explanation is required' });
  }

  try {
    const session = await prisma.leetCodeSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ message: 'LeetCode session not found' });
    }

    const evaluation = await evaluateLeetCodeApproach(
      session.problemTitle,
      session.problemDescription,
      explanation
    );

    const updatedSession = await prisma.leetCodeSession.update({
      where: { id },
      data: {
        userExplanation: explanation,
        aiEvaluation: JSON.stringify(evaluation),
        score: evaluation.score,
      },
    });

    return res.status(200).json(updatedSession);
  } catch (error) {
    console.error('Error evaluating LeetCode explanation:', error);
    return res.status(500).json({ message: 'Failed to evaluate approach. Please try again.' });
  }
};

/**
 * List all sessions
 */
export const listSessions = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const sessions = await prisma.leetCodeSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        topics: true,
        difficulty: true,
        problemTitle: true,
        score: true,
        createdAt: true,
      },
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('Error listing LeetCode sessions:', error);
    return res.status(500).json({ message: 'Failed to retrieve LeetCode rounds' });
  }
};

/**
 * Get single session
 */
export const getSession = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const session = await prisma.leetCodeSession.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({ message: 'LeetCode session not found' });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error getting LeetCode session:', error);
    return res.status(500).json({ message: 'Failed to retrieve LeetCode session' });
  }
};
