import { describe, it, expect } from 'vitest';
import { videoMilestones, getMilestoneFromTime, COMPLETION_THRESHOLD } from '@/config/video-milestones';

describe('videoMilestones', () => {
  it('has correct milestones defined', () => {
    expect(videoMilestones).toHaveLength(3);
    expect(videoMilestones[0]).toEqual({ time: 30, key: 'compliance_feature_shown' });
    expect(videoMilestones[1]).toEqual({ time: 75, key: 'collaboration_feature_shown' });
    expect(videoMilestones[2]).toEqual({ time: 120, key: 'automation_feature_shown' });
  });
});

describe('COMPLETION_THRESHOLD', () => {
  it('is set to 0.9 (90%)', () => {
    expect(COMPLETION_THRESHOLD).toBe(0.9);
  });
});

describe('getMilestoneFromTime', () => {
  it('returns null when no milestones reached', () => {
    const result = getMilestoneFromTime(10, []);
    expect(result).toBeNull();
  });

  it('returns first milestone when time >= 30', () => {
    const result = getMilestoneFromTime(30, []);
    expect(result).toBe('compliance_feature_shown');
  });

  it('returns second milestone when first already reached', () => {
    const result = getMilestoneFromTime(75, ['compliance_feature_shown']);
    expect(result).toBe('collaboration_feature_shown');
  });

  it('returns third milestone when first two already reached', () => {
    const result = getMilestoneFromTime(120, ['compliance_feature_shown', 'collaboration_feature_shown']);
    expect(result).toBe('automation_feature_shown');
  });

  it('returns null if milestone already reached', () => {
    const result = getMilestoneFromTime(30, ['compliance_feature_shown']);
    expect(result).toBeNull();
  });

  it('returns next milestone if first already reached', () => {
    const result = getMilestoneFromTime(75, ['compliance_feature_shown']);
    expect(result).toBe('collaboration_feature_shown');
  });

  it('returns null for time below first milestone', () => {
    const result = getMilestoneFromTime(0, []);
    expect(result).toBeNull();
    expect(result).toBeNull();
  });
});
