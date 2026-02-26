export interface VideoMilestone {
  time: number; // seconds
  key: string;
}

export const videoMilestones: VideoMilestone[] = [
  { time: 30, key: 'compliance_feature_shown' },
  { time: 75, key: 'collaboration_feature_shown' },
  { time: 120, key: 'automation_feature_shown' },
];

export const COMPLETION_THRESHOLD = 0.9; // 90%

export function getMilestoneFromTime(currentTime: number, previousMilestones: string[]): string | null {
  for (const milestone of videoMilestones) {
    if (currentTime >= milestone.time && !previousMilestones.includes(milestone.key)) {
      return milestone.key;
    }
  }
  return null;
}
