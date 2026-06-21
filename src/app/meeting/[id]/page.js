import LiveMeetingRoom from '@/components/meeting/LiveMeetingRoom';

export const metadata = {
  title: 'Live Meeting Room — Nexus',
  description: 'Participate in live meetings and see real-time transcripts, decisions, and precedents.',
};

/**
 * Dynamic route page for live meetings.
 * Reads params server-side and renders client-side LiveMeetingRoom.
 */
export default async function MeetingPage({ params }) {
  const { id } = await params;
  return <LiveMeetingRoom meetingId={id} />;
}
