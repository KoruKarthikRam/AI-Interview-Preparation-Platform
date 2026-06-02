import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';
import { generateRoadmap } from '../services/gemini.service';

/**
 * Generate a new career roadmap
 */
export const createRoadmap = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { skills, targetCompany } = req.body;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!skills || !targetCompany) {
    return res.status(400).json({ message: 'Current skills and target company are required' });
  }

  try {
    const roadmap = await generateRoadmap(skills, targetCompany);

    const dbRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        skills,
        targetCompany,
        roadmapData: JSON.stringify(roadmap),
      },
    });

    return res.status(201).json(dbRoadmap);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    return res.status(500).json({ message: 'Failed to generate preparation roadmap. Please try again.' });
  }
};

/**
 * List all past roadmaps
 */
export const listRoadmaps = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        skills: true,
        targetCompany: true,
        createdAt: true,
      },
    });

    return res.status(200).json(roadmaps);
  } catch (error) {
    console.error('Error listing roadmaps:', error);
    return res.status(500).json({ message: 'Failed to retrieve roadmaps' });
  }
};

/**
 * Get a specific roadmap
 */
export const getRoadmap = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    return res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error getting roadmap:', error);
    return res.status(500).json({ message: 'Failed to retrieve roadmap' });
  }
};
