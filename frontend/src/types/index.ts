export type QuestionTypeName =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_blanks';

export interface QuestionType {
  type: QuestionTypeName;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  duration: number;
  additionalInstructions: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  file?: File | null;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionTypeName;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
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
  _id: string;
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

export interface FormErrors {
  [key: string]: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionTypeName, string> = {
  mcq: 'Multiple Choice (MCQ)',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer',
  true_false: 'True / False',
  fill_blanks: 'Fill in the Blanks',
};

export const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12',
  'Undergraduate', 'Postgraduate',
];

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English Language', 'English Literature', 'History',
  'Geography', 'Computer Science', 'Economics',
  'Political Science', 'Sociology', 'Psychology',
  'Art & Design', 'Music', 'Physical Education', 'Other',
];
