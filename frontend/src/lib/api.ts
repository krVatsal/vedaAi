const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws';

// ─── Types ───
export interface QuestionType {
  type: 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blanks';
  count: number;
  marks: number;
}

export interface Question {
  id: string;
  text: string;
  type: string;
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

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate?: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  duration: number;
  additionalInstructions?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface CreateAssignmentResponse {
  success: boolean;
  assignmentId: string;
  jobId: string;
  status: string;
  message: string;
}

// ─── API Functions ───

export async function getAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${API_BASE}/api/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch assignment');
  return res.json();
}

export async function createAssignment(
  data: CreateAssignmentPayload,
  file?: File
): Promise<CreateAssignmentResponse> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  if (file) {
    formData.append('file', file);
  }

  const res = await fetch(`${API_BASE}/api/assignments`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.details?.[0]?.message || 'Failed to create assignment');
  }

  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete assignment');
}

// ─── WebSocket for Real-time Updates ───

export type JobStatus = 'active' | 'completed' | 'failed';

export interface JobUpdate {
  jobId: string;
  assignmentId: string;
  status: JobStatus;
  progress?: number;
  message?: string;
  result?: GeneratedAssessment;
  error?: string;
}

export function subscribeToAssignment(
  assignmentId: string,
  onUpdate: (update: JobUpdate) => void,
  onError?: (err: Event) => void
): () => void {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'subscribe', assignmentId }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'job_update' && msg.data) {
        onUpdate(msg.data as JobUpdate);
      }
    } catch {
      // ignore parse errors
    }
  };

  ws.onerror = (err) => {
    onError?.(err);
  };

  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
