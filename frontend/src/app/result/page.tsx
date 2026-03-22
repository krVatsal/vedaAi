'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';
import { MobileTopBar } from '@/components/ui/MobileTopBar';
import { Download } from 'lucide-react';

// Sample generated paper content
const paperData = {
  school: 'Delhi Public School, Sector-4, Bokaro',
  subject: 'English',
  class: '5th',
  timeAllowed: '45 minutes',
  maxMarks: 20,
  instructions: 'All questions are compulsory unless stated otherwise.',
  studentFields: [
    'Name: ______________________',
    'Roll Number: ________________',
    'Class: 5th Section: __________',
  ],
  sections: [
    {
      title: 'Section A',
      subtitle: 'Short Answer Questions\nAttempt all questions. Each question carries 2 marks',
      questions: [
        { difficulty: 'Easy', text: 'Define electroplating. Explain its purpose.', marks: 2 },
        { difficulty: 'Moderate', text: 'What is the role of a conductor in the process of electrolysis?', marks: 2 },
        { difficulty: 'Easy', text: 'Why does a solution of copper sulfate conduct electricity?', marks: 2 },
        { difficulty: 'Moderate', text: 'Describe one example of the chemical effect of electric current in daily life.', marks: 2 },
        { difficulty: 'Moderate', text: 'Explain why electric current is said to have chemical effects.', marks: 2 },
        { difficulty: 'Challenging', text: 'How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.', marks: 2 },
        { difficulty: 'Challenging', text: 'What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.', marks: 2 },
        { difficulty: 'Easy', text: 'Mention the type of current used in electroplating and justify why it is used.', marks: 2 },
        { difficulty: 'Moderate', text: 'What is the importance of electric current in the field of metallurgy?', marks: 2 },
        { difficulty: 'Challenging', text: 'Explain with a chemical equation how copper is deposited during the electroplating of an object.', marks: 2 },
      ],
    },
  ],
  answerKey: [
    'Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness.',
    'A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes.',
    'Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity.',
    'An example is the electroplating of silver on jewelry to prevent tarnishing.',
    'Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects.',
    'Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons:\n2H₂O + 2e⁻ → H₂ + 2OH⁻\nNa⁺ + OH⁻ → NaOH (in solution)',
    'At the cathode: water is reduced to hydrogen gas and hydroxide ions.\nAt the anode: water is oxidized to oxygen gas and hydrogen ions.',
    'Direct current (DC) is used because it produces a consistent flow of electrons necessary for controlled deposition of metals.',
    'Electric current helps extract metals from their ores and purify metals by electrolysis in metallurgy.',
    'During copper electroplating, copper ions in solution gain electrons at the cathode and deposit as copper metal:\nCu²⁺ + 2e⁻ → Cu (solid)',
  ],
};

function DifficultyBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    Easy: 'text-green-600',
    Moderate: 'text-amber-600',
    Challenging: 'text-red-500',
  };
  return (
    <span className={`font-semibold ${colorMap[level] || 'text-text-secondary'}`}>
      [{level}]
    </span>
  );
}

export default function ResultPage() {
  const [aiMessage] = useState(
    "Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-gradient-top to-bg-gradient-bottom relative">
      {/* Desktop Sidebar */}
      <Sidebar assignmentCount={32} activePage="home" buttonLabel="AI Teacher's Toolkit" />

      {/* Mobile Top Bar */}
      <MobileTopBar />

      {/* Main Content */}
      <div className="lg:ml-[327px]">
        {/* Desktop Top Bar */}
        <div className="px-0 pt-3 lg:px-0">
          <TopBar />
        </div>

        {/* Content */}
        <main className="px-4 lg:px-5 py-4 pb-8">
          {/* Dark Container */}
          <div className="bg-[#5E5E5E] rounded-[32px] p-3 lg:p-5 flex flex-col items-center gap-3 lg:gap-6">
            {/* ═══ AI Message Card ═══ */}
            <div className="w-full bg-[rgba(24,24,24,0.8)] rounded-[32px] px-4 lg:px-8 py-6 flex flex-col gap-4">
              <p className="text-sm lg:text-xl font-bold tracking-[-0.04em] leading-[140%] text-white lg:text-white">
                {aiMessage}
              </p>
              {/* Download Button */}
              <div className="flex items-start gap-4">
                <button className="flex items-center gap-1 px-6 py-2.5 bg-white rounded-full hover:bg-gray-50 transition-colors">
                  <Download size={24} className="text-text-primary" strokeWidth={2} />
                  <span className="text-base font-medium tracking-[-0.04em] text-text-primary leading-[22px]">
                    Download as PDF
                  </span>
                </button>
              </div>
            </div>

            {/* ═══ Question Paper ═══ */}
            <div className="w-full bg-white rounded-[32px] px-4 lg:px-8 py-6 lg:py-8 flex flex-col items-center gap-6">
              {/* School Header */}
              <div className="text-center">
                <h1 className="text-xl lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  {paperData.school}
                </h1>
                <p className="text-sm lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Subject: {paperData.subject}
                </p>
                <p className="text-sm lg:text-[32px] font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Class: {paperData.class}
                </p>
              </div>

              {/* Time & Marks */}
              <div className="w-full flex justify-between items-center">
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Time Allowed: {paperData.timeAllowed}
                </span>
                <span className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Maximum Marks: {paperData.maxMarks}
                </span>
              </div>

              {/* Instructions */}
              <div className="w-full">
                <p className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  {paperData.instructions}
                </p>
              </div>

              {/* Student Fields */}
              <div className="w-full flex flex-col">
                {paperData.studentFields.map((field, i) => (
                  <span
                    key={i}
                    className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary"
                  >
                    {field}
                  </span>
                ))}
              </div>

              {/* Sections */}
              {paperData.sections.map((section, si) => (
                <div key={si} className="w-full flex flex-col gap-4">
                  {/* Section Title */}
                  <h2 className="text-base lg:text-2xl font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary text-center">
                    {section.title}
                  </h2>

                  {/* Section Subtitle */}
                  <p className="text-sm lg:text-lg font-semibold font-inter tracking-[-0.04em] leading-[160%] text-text-primary whitespace-pre-line">
                    {section.subtitle}
                  </p>

                  {/* Questions */}
                  <div className="flex flex-col gap-2">
                    {section.questions.map((q, qi) => (
                      <p
                        key={qi}
                        className="text-sm lg:text-base font-normal font-inter tracking-[-0.04em] leading-[240%] lg:leading-[240%] text-text-primary"
                      >
                        {qi + 1}.{' '}
                        <DifficultyBadge level={q.difficulty} />{' '}
                        {q.text} [{q.marks} Marks]
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {/* End */}
              <p className="text-sm lg:text-base font-semibold font-inter tracking-[-0.04em] leading-[240%] text-text-primary text-center w-full">
                End of Question Paper
              </p>

              {/* Answer Key */}
              <div className="w-full flex flex-col gap-2">
                <h3 className="text-base lg:text-lg font-bold font-inter tracking-[-0.04em] leading-[160%] text-text-primary">
                  Answer Key:
                </h3>
                {paperData.answerKey.map((answer, ai) => (
                  <p
                    key={ai}
                    className="text-sm lg:text-base font-normal font-inter tracking-[-0.04em] leading-[150%] lg:leading-[240%] text-text-primary whitespace-pre-line"
                  >
                    {ai + 1}. {answer}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
