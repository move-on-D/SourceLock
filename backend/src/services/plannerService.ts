import { queryAll } from '../db/database';

export function generateStudyPlan() {
  try {
    const timetableRow = queryAll("SELECT value FROM memory WHERE key = 'timetable'");
    const syllabusRow = queryAll("SELECT value FROM memory WHERE key = 'syllabus'");

    const timetableText = (timetableRow[0]?.value as string) || '';
    const syllabusText = (syllabusRow[0]?.value as string) || '';

    // Extract subjects or modules from syllabus text
    const syllabusLines = syllabusText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5 && !l.startsWith('==='));

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const plan: any[] = [];

    const defaultSubjects = [
      'Database Management Systems (Relational Model & Normalization)',
      'Operating Systems (Process Synchronization & Deadlocks)',
      'Computer Networks (Routing & TCP/IP Stack)',
      'Design & Analysis of Algorithms (Dynamic Programming)',
      'Software Engineering & Agile Methodologies',
      'Weekly Active Recall & College Internal Revision'
    ];

    days.forEach((day, idx) => {
      let task = defaultSubjects[idx % defaultSubjects.length];

      // Use the student's actual syllabus modules if provided
      if (syllabusLines.length > idx) {
        task = syllabusLines[idx].replace(/^Module\s*\d*:\s*/i, '');
      }

      plan.push({
        day,
        time: '19:30 - 21:30 (Evening Focus)',
        task: `Study Focus: ${task}`,
        pages: `Module ${(idx % 5) + 1} Target`,
        status: 'pending'
      });
    });

    return plan;
  } catch (e) {
    console.error('Planner error:', e);
    return [];
  }
}
