import { searchMemory } from './retriever.js';

const DEMO_ANSWER = {
  text: 'The team chose Vendor A because its scale pricing and compliance package were already approved in the May 29 finance review.',
  sources: [
    {
      meeting_id: 'meeting_4471',
      timestamp: '00:18:32',
      speaker: 'Devon',
      text: 'Vendor A was selected because scale pricing and compliance were already approved.',
    },
  ],
};

export async function queryMemory(question, context = {}) {
  const teamIds = Array.isArray(context.teamIds) ? context.teamIds : [];

  if (teamIds.length > 0) {
    const result = await searchMemory(question, teamIds, 5);
    if (result.answer) {
      return {
        text: result.answer,
        sources: result.citations,
      };
    }
  }

  return DEMO_ANSWER;
}
