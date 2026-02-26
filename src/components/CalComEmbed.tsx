'use client';

import { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Check } from 'lucide-react';

interface CalComEmbedProps {
  leadData: {
    email: string;
    firstName: string;
    districtName?: string;
  };
}

export default function CalComEmbed({ leadData }: CalComEmbedProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const calUsername = process.env.NEXT_PUBLIC_CAL_USERNAME || 'iep-manager';

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.cal?.event === 'bookingSuccessful') {
        setShowSuccess(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const config = {
    name: leadData.firstName,
    email: leadData.email,
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl overflow-hidden"
          >
            <Cal
              calLink={`${calUsername}/walkthrough`}
              style={{ width: '100%', height: '600px' }}
              config={config}
            />
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <PartyPopper className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              You're All Booked!
            </h3>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We've sent a confirmation email to <strong>{leadData.email}</strong>.
              Check your inbox for the calendar invite and meeting details.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">See you at the walkthrough!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
