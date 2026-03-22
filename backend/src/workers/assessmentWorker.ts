import { Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

import { getRedisConnection } from '../services/redis';
import { generateAssessment } from '../services/aiGenerator';
import { QUEUE_NAME } from '../services/queue';
import { AssignmentInput } from '../types';
import mongoose from 'mongoose';
import { AssignmentModel } from '../models/Assignment';
import { wsManager } from '../services/websocket';

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment-creator';
  await mongoose.connect(uri);
  console.log('✅ Worker DB connected');
}

async function processJob(job: Job): Promise<void> {
  const { assignmentId, input } = job.data as {
    assignmentId: string;
    input: AssignmentInput;
  };

  console.log(`Processing job ${job.id} for assignment ${assignmentId}`);

  const sendUpdate = (status: string, progress: number, message: string, extra?: object) => {
    wsManager.broadcast(assignmentId, {
      jobId: job.id!,
      assignmentId,
      status: status as any,
      progress,
      message,
      ...extra,
    });
  };

  try {
    // Update assignment to processing
    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'processing',
      jobId: job.id,
    });

    sendUpdate('active', 5, 'Starting assessment generation...');

    const result = await generateAssessment(
      input,
      async (progress: number, message: string) => {
        await job.updateProgress(progress);
        sendUpdate('active', progress, message);
      }
    );

    // Store result in MongoDB
    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      result,
    });

    sendUpdate('completed', 100, 'Assessment ready!', { result });

    console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
  } catch (error: any) {
    console.error(`❌ Job ${job.id} failed:`, error.message);

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      error: error.message,
    });

    sendUpdate('failed', 0, `Generation failed: ${error.message}`, {
      error: error.message,
    });

    throw error;
  }
}

async function startWorker() {
  await connectDB();

  const worker = new Worker(QUEUE_NAME, processJob, {
    connection: getRedisConnection(),
    concurrency: 3,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
  });

  console.log('✅ Assessment worker started');

  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });
}

startWorker().catch(console.error);
