'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getOrCreateGhostId } from './useGhostId';
import { COMPLETION_THRESHOLD, getMilestoneFromTime } from '@/config/video-milestones';

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

interface UseVideoProgressOptions {
  videoId: string;
  leadId?: string;
  videoDuration: number;
  onMilestoneReached?: (milestone: string) => void;
  onCompleted?: () => void;
}

interface UseVideoProgressReturn {
  isTracking: boolean;
  progress: number;
  currentMilestone: string | null;
  startTracking: () => void;
  stopTracking: () => void;
}

export function useVideoProgress({
  videoId,
  leadId,
  videoDuration,
  onMilestoneReached,
  onCompleted,
}: UseVideoProgressOptions): UseVideoProgressReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);
  const [reachedMilestones, setReachedMilestones] = useState<string[]>([]);
  const [hasCompleted, setHasCompleted] = useState(false);

  const sendProgressUpdate = useCallback(async (currentTime: number) => {
    const ghostId = getOrCreateGhostId();
    
    const body: Record<string, unknown> = {
      video_id: videoId,
      watch_duration_seconds: Math.floor(currentTime),
      current_time: Math.floor(currentTime),
    };

    if (leadId) {
      body.lead_id = leadId;
    } else {
      body.ghost_id = ghostId;
    }

    const milestone = getMilestoneFromTime(currentTime, reachedMilestones);
    if (milestone) {
      body.milestone_reached = milestone;
      setCurrentMilestone(milestone);
      setReachedMilestones((prev) => [...prev, milestone]);
      onMilestoneReached?.(milestone);
    }

    const isCompleted = videoDuration > 0 && currentTime / videoDuration >= COMPLETION_THRESHOLD;
    if (isCompleted && !hasCompleted) {
      body.completed = true;
      setHasCompleted(true);
      onCompleted?.();
    }

    try {
      await fetch('/api/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Failed to send video progress:', error);
    }
  }, [videoId, leadId, videoDuration, reachedMilestones, hasCompleted, onMilestoneReached, onCompleted]);

  const startTracking = useCallback(() => {
    if (isTracking) return;
    setIsTracking(true);
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;
    setIsTracking(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video) {
        const currentProgress = video.duration > 0 ? video.currentTime / video.duration : 0;
        setProgress(currentProgress);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('pause', stopTracking);
    video.addEventListener('ended', stopTracking);

    intervalRef.current = setInterval(() => {
      if (video && !video.paused && !video.ended) {
        sendProgressUpdate(video.currentTime);
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('pause', stopTracking);
      video.removeEventListener('ended', stopTracking);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (video && video.currentTime > 0) {
        sendProgressUpdate(video.currentTime);
      }
    };
  }, [isTracking, sendProgressUpdate, stopTracking]);

  return {
    isTracking,
    progress,
    currentMilestone,
    startTracking,
    stopTracking,
  };
}
