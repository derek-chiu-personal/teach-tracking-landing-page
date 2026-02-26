'use client';

import { useRef, useState, useEffect } from 'react';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useGhostId } from '@/hooks/useGhostId';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Calendar, X } from 'lucide-react';

interface VideoPlayerProps {
  videoId?: string;
  videoSrc?: string;
  onScheduleDemo?: () => void;
}

const VIDEO_CTA_THRESHOLD = 60;

export default function VideoPlayer({ 
  videoId = 'demo-video-1', 
  videoSrc = 'https://www.w3schools.com/html/mov_bbb.mp4',
  onScheduleDemo 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [hasCtaBeenShown, setHasCtaBeenShown] = useState(false);
  const [duration, setDuration] = useState(0);

  const { ghostId } = useGhostId();

  const { 
    progress, 
    currentMilestone,
    startTracking, 
    stopTracking 
  } = useVideoProgress({
    videoId,
    videoDuration: duration,
    onMilestoneReached: (milestone) => {
      console.log('Milestone reached:', milestone);
    },
    onCompleted: () => {
      console.log('Video completed!');
    },
  });

  useEffect(() => {
    if (showCta) return;
    
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= VIDEO_CTA_THRESHOLD && !hasCtaBeenShown) {
        setShowCta(true);
        setHasCtaBeenShown(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [hasCtaBeenShown, showCta]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      startTracking();
    } else {
      video.pause();
      setIsPlaying(false);
      stopTracking();
    }
  };

  const handleScheduleDemo = () => {
    if (onScheduleDemo) {
      onScheduleDemo();
    } else {
      const bookingSection = document.getElementById('book-demo');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCloseCta = () => {
    setShowCta(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoSrc}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false);
          stopTracking();
        }}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {!isPlaying && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg pointer-events-auto"
              onClick={togglePlay}
            >
              <Play className="w-8 h-8 text-gray-900 ml-1" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
          
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          
          <span className="text-white text-sm font-mono">
            {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Video CTA Overlay */}
      <AnimatePresence>
        {showCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-white rounded-xl shadow-2xl p-6"
          >
            <button
              onClick={handleCloseCta}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Want a personalized demo?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Schedule a one-on-one walkthrough with our team.
            </p>
            <button
              onClick={handleScheduleDemo}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book a District Walkthrough
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Indicator */}
      <AnimatePresence>
        {currentMilestone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
          >
            {currentMilestone.replace('_', ' ')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
