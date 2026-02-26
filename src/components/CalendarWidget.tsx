'use client';

import { motion } from 'framer-motion';
import CalComEmbed from './CalComEmbed';

interface CalendarWidgetProps {
  leadEmail?: string;
  leadName?: string;
  leadId?: string;
  districtName?: string;
}

export default function CalendarWidget({ 
  leadEmail, 
  leadName,
  leadId,
  districtName 
}: CalendarWidgetProps) {
  if (!leadEmail || !leadId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 text-center"
      >
        <p className="text-gray-500">
          Please submit the form first to book a walkthrough.
        </p>
      </motion.div>
    );
  }

  const nameParts = (leadName || '').split(' ');
  const firstName = nameParts[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl overflow-hidden"
    >
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Book Your Walkthrough
        </h3>
        <p className="text-sm text-gray-600">
          Scheduling for: <strong>{leadEmail}</strong>
        </p>
      </div>
      
      <CalComEmbed 
        leadData={{
          email: leadEmail,
          firstName: firstName,
          districtName: districtName,
        }}
      />
    </motion.div>
  );
}
