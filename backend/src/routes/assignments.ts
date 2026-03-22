import { Router, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { AssignmentModel } from '../models/Assignment';
import { addGenerationJob } from '../services/queue';
import { cacheGet, cacheSet, cacheDel } from '../services/redis';
import { AssignmentInput } from '../types';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, text, JPEG, and PNG files are allowed'));
    }
  },
});

const QuestionTypeSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks']),
  count: z.number().int().min(1),
  marks: z.number().min(1),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).default('Untitled Assignment'),
  subject: z.string().min(1).max(100).default('General'),
  gradeLevel: z.string().min(1).max(50).default('8th'),
  dueDate: z.string().optional().default(''),
  questionTypes: z.array(QuestionTypeSchema).min(1),
  totalMarks: z.number().min(1).max(1000),
  duration: z.number().int().min(5).max(300).default(60),
  additionalInstructions: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
});

// POST /api/assignments - Create assignment and queue generation
router.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      let body: any;
      if (typeof req.body.data === 'string') {
        body = JSON.parse(req.body.data);
      } else {
        body = req.body;
      }

      // Coerce numeric strings
      if (typeof body.totalMarks === 'string') body.totalMarks = Number(body.totalMarks);
      if (typeof body.duration === 'string') body.duration = Number(body.duration);
      if (body.questionTypes && Array.isArray(body.questionTypes)) {
        body.questionTypes = body.questionTypes.map((qt: any) => ({
          ...qt,
          count: typeof qt.count === 'string' ? Number(qt.count) : qt.count,
          marks: typeof qt.marks === 'string' ? Number(qt.marks) : qt.marks,
        }));
      }

      const validated = CreateAssignmentSchema.parse(body);

      let fileContent: string | undefined;
      if (req.file) {
        if (req.file.mimetype === 'text/plain') {
          fileContent = req.file.buffer.toString('utf-8');
        } else if (req.file.mimetype === 'application/pdf') {
          try {
            const pdfParse = require('pdf-parse');
            const pdfData = await pdfParse(req.file.buffer);
            fileContent = pdfData.text;
          } catch {
            // PDF parsing failed, continue without file content
          }
        } else if (req.file.mimetype.startsWith('image/')) {
          // For images, we note the upload but can't extract text
          fileContent = `[Image uploaded: ${req.file.originalname}]`;
        }
      }

      // Create assignment in DB
      const assignment = await AssignmentModel.create({
        ...validated,
        dueDate: validated.dueDate || '',
        status: 'pending',
      });

      const assignmentId = (assignment._id as any).toString();

      // Add job to queue
      const input: AssignmentInput = {
        ...validated,
        dueDate: validated.dueDate || '',
        fileContent,
      };

      const jobId = await addGenerationJob(assignmentId, input);

      // Update with job ID
      await AssignmentModel.findByIdAndUpdate(assignmentId, { jobId });

      // Invalidate list cache
      await cacheDel('assignments:list');

      res.status(201).json({
        success: true,
        assignmentId,
        jobId,
        status: 'pending',
        message: 'Assessment generation queued',
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      console.error('Create assignment error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// GET /api/assignments - List assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'assignments:list';
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const assignments = await AssignmentModel.find()
      .sort({ createdAt: -1 })
      .select('-result')
      .limit(50);

    await cacheSet(cacheKey, assignments, 30); // 30s cache

    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assignments/:id - Get single assignment with result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `assignment:${id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const assignment = await AssignmentModel.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Cache completed assignments for longer
    if (assignment.status === 'completed') {
      await cacheSet(cacheKey, assignment, 300); // 5 min cache
    }

    res.json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentModel.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Invalidate caches
    await cacheDel(`assignment:${id}`);
    await cacheDel('assignments:list');

    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assignments/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentModel.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Reset status
    await AssignmentModel.findByIdAndUpdate(id, {
      status: 'pending',
      result: undefined,
      error: undefined,
    });

    // Invalidate cache
    await cacheDel(`assignment:${id}`);
    await cacheDel('assignments:list');

    const input: AssignmentInput = {
      title: assignment.title,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      totalMarks: assignment.totalMarks,
      duration: assignment.duration,
      additionalInstructions: assignment.additionalInstructions,
      difficulty: assignment.difficulty,
    };

    const jobId = await addGenerationJob(id, input);
    await AssignmentModel.findByIdAndUpdate(id, { jobId });

    res.json({ success: true, jobId, message: 'Regeneration queued' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
