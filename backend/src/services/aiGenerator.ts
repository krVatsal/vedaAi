import Groq from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';
import { AssignmentInput, GeneratedAssessment, Section, Question } from '../types';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function buildPrompt(input: AssignmentInput): string {
  const questionBreakdown = input.questionTypes
    .map(
      (qt) =>
        `- ${qt.count} ${qt.type.replace('_', ' ')} questions (${qt.marks} marks each)`
    )
    .join('\n');
  const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.count, 0);

  return `You are an expert academic assessment creator. Generate a structured question paper based on the following specifications.

ASSIGNMENT DETAILS:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Total Marks: ${input.totalMarks}
- Duration: ${input.duration} minutes
- Difficulty: ${input.difficulty}

QUESTION REQUIREMENTS:
${questionBreakdown}

${input.additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${input.additionalInstructions}` : ''}

${input.fileContent ? `REFERENCE CONTENT:\n${input.fileContent.substring(0, 3000)}` : ''}

Generate a complete question paper in the following EXACT JSON format. Do not include any text outside the JSON:

{
  "title": "${input.title}",
  "subject": "${input.subject}",
  "gradeLevel": "${input.gradeLevel}",
  "duration": ${input.duration},
  "totalMarks": ${input.totalMarks},
  "instructions": [
    "Read all questions carefully before answering.",
    "Write legibly and clearly.",
    "All questions are compulsory unless stated otherwise.",
    "Marks are indicated against each question."
  ],
  "sections": [
    {
      "id": "section-a",
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries equal marks.",
      "totalMarks": 20,
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "type": "mcq",
          "difficulty": "easy",
          "marks": 2,
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Correct answer or explanation"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
1. Group questions into sections (Section A for MCQ/True-False, Section B for Short Answer, Section C for Long Answer)
2. Each question must have a difficulty: "easy", "medium", or "hard"
3. MCQ questions MUST have exactly 4 options array
4. The sum of all question marks MUST equal ${input.totalMarks}
5. Generate realistic, subject-appropriate questions for ${input.subject} at ${input.gradeLevel} level
6. Distribute difficulty: ${input.difficulty === 'mixed' ? '40% easy, 40% medium, 20% hard' : `all ${input.difficulty}`}
7. Include an "answer" field for each question with the correct answer or a brief model answer
8. Use this exact question-type breakdown with no extras and no omissions:
${questionBreakdown}
9. The total number of questions across all sections must be exactly ${totalQuestions}
10. The title must be exactly "${input.title}", the subject must be exactly "${input.subject}", and the gradeLevel must be exactly "${input.gradeLevel}"
11. Return ONLY valid JSON, no markdown, no explanation`;
}

export async function generateAssessment(
  input: AssignmentInput,
  onProgress?: (progress: number, message: string) => void
): Promise<GeneratedAssessment> {
  onProgress?.(10, 'Building assessment prompt...');

  const prompt = buildPrompt(input);

  onProgress?.(20, 'Connecting to Groq AI...');

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic assessment creator. Always respond with valid JSON only, no markdown formatting, no backticks, no explanation text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  });

  onProgress?.(70, 'Parsing AI response...');

  const rawText = response.choices[0]?.message?.content || '';

  // Extract JSON from response (handle potential markdown wrapping)
  let jsonStr = rawText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsed: Omit<GeneratedAssessment, 'generatedAt'>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    // Try to extract JSON object from text
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      parsed = JSON.parse(jsonStr.substring(startIdx, endIdx + 1));
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  onProgress?.(85, 'Structuring question paper...');

  // Validate and normalize the parsed data
  const assessment = normalizeAssessment(parsed, input);

  onProgress?.(100, 'Assessment generated successfully!');

  return assessment;
}

function normalizeAssessment(
  parsed: any,
  input: AssignmentInput
): GeneratedAssessment {
  const sections: Section[] = (parsed.sections || []).map(
    (section: any, sIdx: number) => {
      const questions: Question[] = (section.questions || []).map(
        (q: any, qIdx: number) => ({
          id: q.id || uuidv4(),
          text: q.text || `Question ${qIdx + 1}`,
          type: q.type || 'short_answer',
          difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty)
            ? q.difficulty
            : 'medium',
          marks: typeof q.marks === 'number' ? q.marks : 1,
          options: Array.isArray(q.options) ? q.options : undefined,
          answer: q.answer,
        })
      );

      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      return {
        id: section.id || `section-${String.fromCharCode(65 + sIdx).toLowerCase()}`,
        title: section.title || `Section ${String.fromCharCode(65 + sIdx)}`,
        instruction:
          section.instruction || 'Attempt all questions in this section.',
        questions,
        totalMarks,
      };
    }
  );

  return {
    title: input.title,
    subject: input.subject,
    gradeLevel: input.gradeLevel,
    duration: input.duration,
    totalMarks: input.totalMarks,
    instructions: Array.isArray(parsed.instructions)
      ? parsed.instructions
      : [
          'Read all questions carefully before answering.',
          'All questions are compulsory unless stated otherwise.',
          'Marks are indicated against each question.',
        ],
    sections,
    generatedAt: new Date().toISOString(),
  };
}
