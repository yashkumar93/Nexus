const DEMO_SUMMARY = Object.freeze({
  decisions: [
    'Keep Vendor A as the active payments decision until compliance signs off on Vendor B.',
  ],
  actionItems: [
    'Devon will attach Vendor A contract thresholds to the launch brief.',
    'Maya will verify whether Vendor B has the required compliance certification.',
  ],
});

export async function generateMeetingSummary() {
  return DEMO_SUMMARY;
}
