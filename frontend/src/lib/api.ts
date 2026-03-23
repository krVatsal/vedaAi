const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getDefaultWsUrl() {
  const configuredWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (configuredWsUrl) return configuredWsUrl;

  try {
    const apiUrl = new URL(API_BASE);
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    apiUrl.pathname = '/ws';
    apiUrl.search = '';
    apiUrl.hash = '';
    return apiUrl.toString();
  } catch {
    return 'ws://localhost:5000/ws';
  }
}

const WS_URL = getDefaultWsUrl();

import type {
  QuestionType,
  Question,
  Section,
  GeneratedAssessment,
  Assignment,
  JobStatus,
  JobUpdate
} from '@/types';

export type {
  QuestionType,
  Question,
  Section,
  GeneratedAssessment,
  Assignment,
  JobStatus,
  JobUpdate
};
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

export async function regenerateAssessment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/assignments/${id}/regenerate`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Failed to regenerate assignment');
  }
}

// ─── WebSocket for Real-time Updates ───

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
