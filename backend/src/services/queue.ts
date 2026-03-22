import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { getRedisConnection } from './redis';
import { AssignmentInput, JobUpdate } from '../types';

export const QUEUE_NAME = 'assessment-generation';

let assessmentQueue: Queue | null = null;
let queueEvents: QueueEvents | null = null;

export function getAssessmentQueue(): Queue {
  if (!assessmentQueue) {
    assessmentQueue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection() as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return assessmentQueue;
}

export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    queueEvents = new QueueEvents(QUEUE_NAME, {
      connection: getRedisConnection() as any,
    });
  }
  return queueEvents;
}

export async function addGenerationJob(
  assignmentId: string,
  input: AssignmentInput & { fileContent?: string }
): Promise<string> {
  const queue = getAssessmentQueue();
  const job = await queue.add(
    'generate-assessment',
    { assignmentId, input },
    { jobId: `job-${assignmentId}` }
  );
  return job.id!;
}

export type { Job };
