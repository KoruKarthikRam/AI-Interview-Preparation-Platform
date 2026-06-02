import { Response } from 'express';
import fs from 'fs';
import pdf from 'pdf-parse';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/jwt.middleware';
import { analyzeResumeText } from '../services/gemini.service';

/**
 * Upload and Analyze Resume PDF
 */
export const uploadResume = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const file = req.file;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!file) {
    return res.status(400).json({ message: 'Please upload a PDF resume file' });
  }

  const filePath = file.path;

  try {
    // 1. Read PDF file and parse text
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        message: 'The uploaded PDF is empty or does not contain readable text. Please try another file.',
      });
    }

    // 2. Call Gemini Service to analyze resume text
    const analysis = await analyzeResumeText(resumeText);

    // 3. Save resume and analysis in DB
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`, // Mock URL or path
        resumeText,
        skills: JSON.stringify(analysis.skills),
        missingSkills: JSON.stringify(analysis.missingSkills),
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
      },
    });

    // 4. Return results (parse strings back to arrays)
    return res.status(201).json({
      id: resume.id,
      fileName: resume.fileName,
      createdAt: resume.createdAt,
      skills: analysis.skills,
      missingSkills: analysis.missingSkills,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
    });
  } catch (error) {
    console.error('Error uploading/analyzing resume:', error);
    return res.status(500).json({
      message: 'Failed to process and analyze the resume. Please make sure it is a valid PDF text file.',
    });
  } finally {
    // 5. Clean up temporary uploaded file from disk
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('Failed to delete temporary upload:', cleanupErr);
    }
  }
};

/**
 * Get User's Latest Resume Analysis
 */
export const getLatestResume = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found for this user.' });
    }

    return res.status(200).json({
      id: resume.id,
      fileName: resume.fileName,
      createdAt: resume.createdAt,
      skills: JSON.parse(resume.skills),
      missingSkills: JSON.parse(resume.missingSkills),
      strengths: JSON.parse(resume.strengths),
      weaknesses: JSON.parse(resume.weaknesses),
    });
  } catch (error) {
    console.error('Error fetching latest resume:', error);
    return res.status(500).json({ message: 'Failed to retrieve resume analysis' });
  }
};

/**
 * Get Resume Analysis by ID
 */
export const getResumeById = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.userId !== userId) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    return res.status(200).json({
      id: resume.id,
      fileName: resume.fileName,
      createdAt: resume.createdAt,
      skills: JSON.parse(resume.skills),
      missingSkills: JSON.parse(resume.missingSkills),
      strengths: JSON.parse(resume.strengths),
      weaknesses: JSON.parse(resume.weaknesses),
    });
  } catch (error) {
    console.error('Error fetching resume by ID:', error);
    return res.status(500).json({ message: 'Failed to retrieve resume details' });
  }
};
