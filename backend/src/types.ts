export interface QuestionType {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blanks';
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  duration: number; // in minutes
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded PDF/file
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blanks';
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[]; // for MCQ
  answer?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
  totalMarks: number;
}

export interface GeneratedAssessment {
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  totalMarks: number;
  instructions: string[];
  sections: Section[];
  generatedAt: string;
}

export interface Assignment {
  _id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  duration: number;
  additionalInstructions?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: GeneratedAssessment;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed';

export interface JobUpdate {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress?: number;
  message?: string;
  result?: GeneratedAssessment;
  error?: string;
}
