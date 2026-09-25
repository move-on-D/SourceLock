import { queryAll } from '../db/database';

export function generateStudyPlan() {
  try {
    const timetableRow = queryAll("SELECT value FROM memory WHERE key = 'timetable'");
    const syllabusRow = queryAll("SELECT value FROM memory WHERE key = 'syllabus'");
    const documents = queryAll("SELECT id, originalName FROM documents WHERE status = 'ready'");

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const plan: any[] = [];
    let docIndex = 0;

    for (const day of days) {
      if (documents.length > 0) {
        const doc = documents[docIndex % documents.length];
        const startPage = (docIndex * 15) + 1;
        const endPage = startPage + 14;

        plan.push({
          day,
          time: '19:00 - 21:00',
          task: `Study ${doc.originalName}`,
          pages: `${startPage} - ${endPage}`,
          status: 'pending'
        });
        docIndex++;
      } else {
        plan.push({
          day,
          time: '19:00 - 21:00',
          task: 'Upload study materials to vault to get AI suggestions',
          pages: 'N/A',
          status: 'pending'
        });
      }
    }

    return plan;
  } catch (e) {
    console.error('Planner error:', e);
    return [];
  }
}
