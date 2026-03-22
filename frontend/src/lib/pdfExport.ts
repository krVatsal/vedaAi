import { GeneratedAssessment, Section, Question } from '@/types';

export async function exportToPDF(assessment: GeneratedAssessment, studentInfo?: {
  name?: string;
  rollNumber?: string;
  section?: string;
}): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // ─── Header ───────────────────────────────────────────────────
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(assessment.title, pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${assessment.subject} | ${assessment.gradeLevel}`,
    pageWidth / 2,
    24,
    { align: 'center' }
  );

  doc.setFontSize(10);
  doc.text(
    `Duration: ${assessment.duration} min  |  Total Marks: ${assessment.totalMarks}`,
    pageWidth / 2,
    32,
    { align: 'center' }
  );

  y = 50;

  // ─── Student Info ─────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 22);

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const fields = [
    ['Name', studentInfo?.name || '_________________________'],
    ['Roll No.', studentInfo?.rollNumber || '___________'],
    ['Section', studentInfo?.section || '___________'],
  ];

  const colW = contentWidth / 3;
  fields.forEach(([label, value], i) => {
    const x = margin + i * colW + 4;
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, x, y + 8);
    doc.setFont('helvetica', 'normal');
    const labelW = doc.getTextWidth(`${label}: `);
    doc.text(value, x + labelW, y + 8);
  });

  y += 30;

  // ─── Instructions ─────────────────────────────────────────────
  if (assessment.instructions?.length) {
    doc.setFillColor(245, 245, 250);
    doc.rect(margin, y, contentWidth, 6 + assessment.instructions.length * 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('GENERAL INSTRUCTIONS:', margin + 4, y + 5);

    y += 8;
    doc.setFont('helvetica', 'normal');
    assessment.instructions.forEach((inst, i) => {
      doc.text(`${i + 1}. ${inst}`, margin + 4, y);
      y += 5;
    });
    y += 5;
  }

  // ─── Sections & Questions ─────────────────────────────────────
  const difficultyColors: Record<string, [number, number, number]> = {
    easy: [0, 180, 120],
    medium: [240, 160, 30],
    hard: [220, 70, 70],
  };

  assessment.sections.forEach((section: Section) => {
    checkPageBreak(20);

    // Section header
    doc.setFillColor(10, 10, 15);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`[${section.totalMarks} Marks]`, margin + contentWidth - 4, y + 7, { align: 'right' });
    y += 14;

    // Section instruction
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(section.instruction, margin, y);
    y += 7;

    // Questions
    section.questions.forEach((q: Question, qi: number) => {
      const estimatedH = q.type === 'long_answer' ? 40 : q.type === 'mcq' ? 30 : 20;
      checkPageBreak(estimatedH);

      // Question row
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);

      const qNum = `Q${qi + 1}.`;
      doc.text(qNum, margin, y);

      // Wrap question text
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(q.text, contentWidth - 30);
      doc.text(lines, margin + 10, y);

      // Marks badge (right side)
      const markText = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.text(markText, margin + contentWidth, y, { align: 'right' });

      y += lines.length * 5 + 2;

      // Difficulty badge
      const color = difficultyColors[q.difficulty] || [100, 100, 100];
      doc.setTextColor(...color);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`◆ ${q.difficulty.toUpperCase()}`, margin + 10, y);
      y += 5;

      // MCQ Options
      if (q.type === 'mcq' && q.options) {
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const labels = ['(a)', '(b)', '(c)', '(d)'];
        q.options.forEach((opt, oi) => {
          checkPageBreak(6);
          const colX = margin + 10 + (oi % 2 === 0 ? 0 : contentWidth / 2);
          if (oi % 2 === 0 && oi > 0) y += 5;
          doc.text(`${labels[oi]} ${opt}`, colX, y);
          if (oi % 2 !== 0) y += 5;
        });
        if (q.options.length % 2 !== 0) y += 5;
      }

      // Answer line for non-MCQ
      if (q.type !== 'mcq' && q.type !== 'true_false') {
        const lines2 = q.type === 'long_answer' ? 6 : 2;
        for (let l = 0; l < lines2; l++) {
          checkPageBreak(7);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin + 10, y + 4, margin + contentWidth, y + 4);
          y += 7;
        }
      }

      y += 5;
    });

    y += 5;
  });

  // ─── Footer ───────────────────────────────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by VedaAI Assessment Creator | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`${assessment.title.replace(/\s+/g, '_')}_paper.pdf`);
}
