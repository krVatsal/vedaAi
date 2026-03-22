import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AssignmentFormData,
  Assignment,
  GeneratedAssessment,
  JobUpdate,
  QuestionType,
} from '@/types';

interface AssessmentStore {
  // Form state
  formData: AssignmentFormData;
  formStep: number;
  isSubmitting: boolean;

  // Assignment state
  currentAssignmentId: string | null;
  currentJobId: string | null;
  assignments: Assignment[];

  // Job/generation state
  jobStatus: JobUpdate | null;
  generatedAssessment: GeneratedAssessment | null;

  // Actions
  setFormData: (data: Partial<AssignmentFormData>) => void;
  setFormStep: (step: number) => void;
  addQuestionType: (qt: QuestionType) => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, qt: Partial<QuestionType>) => void;
  resetForm: () => void;

  setCurrentAssignment: (id: string, jobId: string) => void;
  setAssignments: (assignments: Assignment[]) => void;
  setJobUpdate: (update: JobUpdate) => void;
  setGeneratedAssessment: (assessment: GeneratedAssessment | null) => void;
  setIsSubmitting: (v: boolean) => void;
}

const defaultFormData: AssignmentFormData = {
  title: '',
  subject: '',
  gradeLevel: '',
  dueDate: '',
  questionTypes: [],
  totalMarks: 100,
  duration: 60,
  additionalInstructions: '',
  difficulty: 'mixed',
  file: null,
};

export const useAssessmentStore = create<AssessmentStore>()(
  devtools(
    (set, get) => ({
      formData: { ...defaultFormData },
      formStep: 0,
      isSubmitting: false,

      currentAssignmentId: null,
      currentJobId: null,
      assignments: [],

      jobStatus: null,
      generatedAssessment: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setFormStep: (step) => set({ formStep: step }),

      addQuestionType: (qt) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: [...state.formData.questionTypes, qt],
          },
        })),

      removeQuestionType: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter(
              (_, i) => i !== index
            ),
          },
        })),

      updateQuestionType: (index, qt) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.map((item, i) =>
              i === index ? { ...item, ...qt } : item
            ),
          },
        })),

      resetForm: () =>
        set({
          formData: { ...defaultFormData },
          formStep: 0,
          currentAssignmentId: null,
          currentJobId: null,
          jobStatus: null,
          generatedAssessment: null,
        }),

      setCurrentAssignment: (id, jobId) =>
        set({ currentAssignmentId: id, currentJobId: jobId }),

      setAssignments: (assignments) => set({ assignments }),

      setJobUpdate: (update) => {
        set({ jobStatus: update });
        if (update.result) {
          set({ generatedAssessment: update.result });
        }
      },

      setGeneratedAssessment: (assessment) =>
        set({ generatedAssessment: assessment }),

      setIsSubmitting: (v) => set({ isSubmitting: v }),
    }),
    { name: 'assessment-store' }
  )
);
