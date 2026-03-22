import mongoose, { Schema, Document } from 'mongoose';
import { Assignment } from '../types';

export interface AssignmentDocument extends Omit<Assignment, '_id'>, Document {}

const QuestionTypeSchema = new Schema({
  type: {
    type: String,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks'],
    required: true,
  },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  marks: { type: Number, required: true },
  options: [{ type: String }],
  answer: { type: String },
});

const SectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
  totalMarks: { type: Number, required: true },
});

const GeneratedAssessmentSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  duration: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  instructions: [{ type: String }],
  sections: [SectionSchema],
  generatedAt: { type: String, required: true },
});

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    dueDate: { type: String, required: true },
    questionTypes: [QuestionTypeSchema],
    totalMarks: { type: Number, required: true },
    duration: { type: Number, required: true },
    additionalInstructions: { type: String },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    result: { type: GeneratedAssessmentSchema },
    error: { type: String },
  },
  { timestamps: true }
);

export const AssignmentModel = mongoose.model<AssignmentDocument>(
  'Assignment',
  AssignmentSchema
);
