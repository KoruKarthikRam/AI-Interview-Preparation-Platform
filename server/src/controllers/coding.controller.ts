import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';
import { generateCodingProblem, evaluateCodingSubmission } from '../services/gemini.service';

/**
 * Create a new Code Assessment
 */
export const createAssessment = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { language, difficulty } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!language || !difficulty) {
    return res.status(400).json({ message: 'Language and difficulty are required' });
  }

  try {
    const problem = await generateCodingProblem(language, difficulty);

    const problemDescription = `
${problem.description}

### Examples
${problem.examples.map(ex => `\`\`\`\n${ex}\n\`\`\``).join('\n\n')}

### Constraints
${problem.constraints.map((c) => `- ${c}`).join('\n')}
`;

    const assessment = await prisma.codingAssessment.create({
      data: {
        userId,
        difficulty,
        language,
        problemTitle: problem.title,
        problemDescription,
        starterCode: problem.starterCode,
      },
    });

    return res.status(201).json(assessment);
  } catch (error) {
    console.error('Error creating coding assessment:', error);
    return res.status(500).json({ message: 'Failed to generate coding problem. Please try again.' });
  }
};

/**
 * Submit code for evaluation
 */
export const submitCode = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { code } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (code === undefined || code.trim() === '') {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    const assessment = await prisma.codingAssessment.findFirst({
      where: { id, userId },
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Coding assessment not found' });
    }

    const evaluation = await evaluateCodingSubmission(
      assessment.problemTitle,
      assessment.problemDescription,
      code,
      assessment.language
    );

    const updatedAssessment = await prisma.codingAssessment.update({
      where: { id },
      data: {
        code,
        timeComplexity: evaluation.timeComplexity,
        spaceComplexity: evaluation.spaceComplexity,
        edgeCases: evaluation.edgeCasesFeedback,
        codeQuality: evaluation.codeQualityFeedback,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    });

    return res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error('Error evaluating coding submission:', error);
    return res.status(500).json({ message: 'Failed to evaluate code. Please try again.' });
  }
};

/**
 * List all assessments
 */
export const listAssessments = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const assessments = await prisma.codingAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        difficulty: true,
        language: true,
        problemTitle: true,
        score: true,
        createdAt: true,
      },
    });

    return res.status(200).json(assessments);
  } catch (error) {
    console.error('Error listing coding assessments:', error);
    return res.status(500).json({ message: 'Failed to retrieve code assessments' });
  }
};

/**
 * Get details of a single assessment
 */
export const getAssessment = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const assessment = await prisma.codingAssessment.findFirst({
      where: { id, userId },
    });

    if (!assessment) {
      return res.status(404).json({ message: 'Coding assessment not found' });
    }

    return res.status(200).json(assessment);
  } catch (error) {
    console.error('Error getting coding assessment:', error);
    return res.status(500).json({ message: 'Failed to retrieve coding assessment' });
  }
};
