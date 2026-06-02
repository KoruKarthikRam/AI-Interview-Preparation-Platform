import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';
import { generateInterviewQuestions, evaluateAnswer } from '../services/gemini.service';

/**
 * Generate a new Mock Interview with 10 questions
 */
export const createInterview = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { role, difficulty } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!role || !difficulty) {
    return res.status(400).json({ message: 'Role and difficulty are required' });
  }

  try {
    // 1. Fetch latest resume to customize questions (if available)
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const resumeText = latestResume ? latestResume.resumeText : 'No resume uploaded yet. Generate general questions.';

    // 2. Generate questions from Gemini
    const rawQuestions = await generateInterviewQuestions(role, difficulty, resumeText);

    // 3. Create Interview entry in DB
    const interview = await prisma.interview.create({
      data: {
        userId,
        title: `${role} Mock Interview`,
        role,
        difficulty,
      },
    });

    // 4. Create Question entries in DB
    const questionData = rawQuestions.map((q) => ({
      interviewId: interview.id,
      questionText: q.questionText,
      type: q.type,
      order: q.order,
    }));

    await prisma.question.createMany({
      data: questionData,
    });

    // 5. Query questions back to ensure they are fetched in order
    const questions = await prisma.question.findMany({
      where: { interviewId: interview.id },
      orderBy: { order: 'asc' },
    });

    return res.status(201).json({
      id: interview.id,
      title: interview.title,
      role: interview.role,
      difficulty: interview.difficulty,
      createdAt: interview.createdAt,
      questions,
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    return res.status(500).json({ message: 'Failed to create mock interview. Please try again.' });
  }
};

/**
 * Get details of a specific interview including questions and answers
 */
export const getInterview = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            answer: true,
          },
        },
      },
    });

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    return res.status(200).json(interview);
  } catch (error) {
    console.error('Error fetching interview:', error);
    return res.status(500).json({ message: 'Failed to retrieve interview session' });
  }
};

/**
 * Submit an answer for a specific question & evaluate it with Gemini
 */
export const submitAnswer = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { interviewId, questionId } = req.params;
  const { answerText } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (answerText === undefined) {
    return res.status(400).json({ message: 'Answer text is required' });
  }

  try {
    // 1. Verify question and interview ownership
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        interviewId,
        interview: { userId },
      },
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found in this interview session' });
    }

    // 2. Evaluate candidate's answer with Gemini
    const evaluation = await evaluateAnswer(question.questionText, answerText);

    // 3. Upsert answer in the DB (can submit multiple times for the same question if allowed, or overwrite)
    const answer = await prisma.answer.upsert({
      where: { questionId },
      update: {
        answerText,
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvement: evaluation.improvement,
      },
      create: {
        questionId,
        answerText,
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvement: evaluation.improvement,
      },
    });

    return res.status(200).json(answer);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return res.status(500).json({ message: 'Failed to evaluate answer. Please try again.' });
  }
};

/**
 * Finish the interview and calculate final feedback/score
 */
export const completeInterview = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 1. Fetch interview with all questions and answers
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answer: true,
          },
        },
      },
    });

    if (!interview || interview.userId !== userId) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // 2. Compute average score
    const answers = interview.questions
      .map((q) => q.answer)
      .filter((ans): ans is Exclude<typeof ans, null> => ans !== null);

    if (answers.length === 0) {
      return res.status(400).json({ message: 'Cannot complete an interview with no answers.' });
    }

    const totalScore = answers.reduce((sum, ans) => sum + ans.score, 0);
    const averageScore = Math.round((totalScore / answers.length) * 10) / 10; // 1 decimal place

    // 3. Generate summary feedback string
    let feedback = '';
    if (averageScore >= 8.5) {
      feedback = 'Outstanding performance! You demonstrated a deep understanding of core concepts, projects, and structured communication. Keep refining and practicing!';
    } else if (averageScore >= 7.0) {
      feedback = 'Good job! You have a solid grasp of most topics, but there are areas to polish, especially in technical terminology and specific project-based scenarios.';
    } else if (averageScore >= 5.0) {
      feedback = 'Decent effort. You understood some concepts, but missed key technical details or left answers incomplete. Review the suggested tips and focus on foundational concepts.';
    } else {
      feedback = 'Needs improvement. Many answers were brief or missed the point of the questions. We recommend parsing your resume, reviewing missing skills, and studying standard interview formats before your next attempt.';
    }

    // 4. Update interview with overall score and feedback
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        score: averageScore,
        feedback,
      },
    });

    return res.status(200).json(updatedInterview);
  } catch (error) {
    console.error('Error completing interview:', error);
    return res.status(500).json({ message: 'Failed to complete interview session' });
  }
};

/**
 * List all past mock interviews for this user
 */
export const listInterviews = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        role: true,
        difficulty: true,
        score: true,
        createdAt: true,
      },
    });

    return res.status(200).json(interviews);
  } catch (error) {
    console.error('Error listing interviews:', error);
    return res.status(500).json({ message: 'Failed to retrieve past interview sessions' });
  }
};
