'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, FileCheck, CalendarClock, Users, BarChart3, CheckCircle, ChevronDown } from 'lucide-react';

const FLOW_STAGES = [
  { id: 'context', label: 'Context' },
  { id: 'step1', label: 'IEP Creation' },
  { id: 'step2', label: 'Safeguards' },
  { id: 'step3', label: 'Collaboration' },
  { id: 'step4', label: 'Intelligence' },
  { id: 'result', label: 'Result' },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function FlowConnector() {
  return (
    <div className="flex flex-col items-center py-4" aria-hidden>
      <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
      <ChevronDown className="w-6 h-6 text-gray-400 mt-1" />
      <div className="w-0.5 h-4 bg-gray-300 rounded-full mt-1" />
    </div>
  );
}

export default function SystemOverview() {
  const [activeStage, setActiveStage] = useState<(typeof FLOW_STAGES)[number]['id']>('context');

  const handleStageClick = (id: (typeof FLOW_STAGES)[number]['id']) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="system-overview" className="py-24 bg-white" aria-label="How TeachTracker works in practice — flow">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How TeachTracker Works in Practice
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            See how a typical case manager uses TeachTracker every day.
          </p>

          {/* Flow stages strip — visible sequence + jump-to-stage */}
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-sm">
            {FLOW_STAGES.map((stage, i) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageClick(stage.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 py-1 rounded-md border transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-medium">
                    {i + 1}. {stage.label}
                  </span>
                  {i < FLOW_STAGES.length - 1 && (
                    <span className="text-gray-200 hidden sm:inline" aria-hidden>
                      →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Flow: Context (Sarah) */}
        <motion.div
          id="context"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          onViewportEnter={() => setActiveStage('context')}
          className="flow-stage"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
              1
            </span>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Context</span>
          </div>
          <motion.div
            variants={item}
            className="p-8 rounded-2xl border border-blue-100 bg-blue-50/50 mb-0"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Meet Sarah — Special Education Case Manager
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Sarah manages 28 students across two campuses.
            </p>
            <p className="text-gray-700 font-medium mb-3">
              Her responsibilities include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Drafting and updating IEPs</li>
              <li>Coordinating with general education teachers</li>
              <li>Scheduling annual and triennial meetings</li>
              <li>Tracking service minutes</li>
              <li>Communicating with parents</li>
              <li>Preparing documentation for audits</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Before TeachTracker, her workflow lived across spreadsheets, shared drives, email threads, and calendar reminders.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Deadlines required constant manual tracking.</li>
              <li>Service documentation required cross-checking.</li>
              <li>Audit preparation meant late nights.</li>
            </ul>
          </motion.div>
        </motion.div>

        <FlowConnector />

        {/* Flow: Step 1 */}
        <FlowStepCard
          stageId="step1"
          setActiveStage={setActiveStage}
          flowStep={2}
          title="Structured IEP Creation"
          icon={<FileCheck className="w-6 h-6 text-blue-600" />}
          intro="When Sarah creates a new IEP inside TeachTracker:"
          bullets={[
            'The system dynamically structures required fields based on student eligibility',
            'Built-in validation flags missing or inconsistent entries in real time',
            'State-aligned compliance checks run automatically in the background',
          ]}
          outcome="Instead of wondering whether the document is complete, she sees a live compliance status indicator."
          outcomeBullets={[
            'Compliance isn\'t reviewed later.',
            'It\'s embedded during creation.',
          ]}
          accent="blue"
        />

        <FlowConnector />

        {/* Flow: Step 2 */}
        <FlowStepCard
          stageId="step2"
          setActiveStage={setActiveStage}
          flowStep={3}
          title="Automated Safeguards & Deadlines"
          icon={<CalendarClock className="w-6 h-6 text-indigo-600" />}
          intro="TeachTracker continuously monitors:"
          bullets={[
            'Annual review dates',
            'Evaluation timelines',
            'Service delivery requirements',
            'Meeting scheduling windows',
          ]}
          outcome="Sarah and her administrator receive proactive alerts long before deadlines approach."
          outcomeBullets={[
            'No more spreadsheet reminders.',
            'No more reactive scrambles.',
          ]}
          tail="District leaders see a dashboard-level compliance health score across campuses."
          accent="indigo"
        />

        <FlowConnector />

        {/* Flow: Step 3 */}
        <FlowStepCard
          stageId="step3"
          setActiveStage={setActiveStage}
          flowStep={4}
          title="Unified Collaboration"
          icon={<Users className="w-6 h-6 text-purple-600" />}
          intro="General education teachers log in to:"
          bullets={[
            'Review accommodations',
            'Acknowledge implementation',
            'Track service minutes',
          ]}
          outcome="Parents access a simplified portal that provides:"
          outcomeBullets={[
            'Clear visibility into goals',
            'Meeting summaries',
            'Progress updates',
          ]}
          tail="Everyone works from the same source of truth. No fragmented communication. No conflicting documentation."
          accent="purple"
        />

        <FlowConnector />

        {/* Flow: Step 4 */}
        <FlowStepCard
          stageId="step4"
          setActiveStage={setActiveStage}
          flowStep={5}
          title="District-Level Intelligence"
          icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
          intro="Administrators don't wait for audits to discover gaps. TeachTracker aggregates data across schools to provide:"
          bullets={[
            'Compliance status by campus',
            'Service delivery trends',
            'Upcoming risk indicators',
            'Documentation completeness reports',
          ]}
          outcome="What used to require weeks of manual preparation becomes available in seconds."
          accent="emerald"
        />

        <FlowConnector />

        {/* Flow: The Result */}
        <motion.div
          id="result"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          onViewportEnter={() => setActiveStage('result')}
          className="flow-stage"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
              6
            </span>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Result</span>
          </div>
          <motion.div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">The Result</h3>
            </div>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Sarah spends less time managing paperwork.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Administrators gain real-time oversight.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Parents gain transparency.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                Compliance becomes proactive instead of reactive.
              </li>
            </ul>
            <p className="text-gray-600 italic">
              TeachTracker isn't just a digital IEP form.
            </p>
            <p className="text-gray-900 font-semibold mt-2">
              It's the operational infrastructure for special education.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

type Accent = 'blue' | 'indigo' | 'purple' | 'emerald';

const accentClasses: Record<Accent, { bg: string; border: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100' },
};

function FlowStepCard({
  stageId,
  setActiveStage,
  flowStep,
  title,
  icon,
  intro,
  bullets,
  outcome,
  outcomeBullets,
  tail,
  accent,
}: {
  stageId: (typeof FLOW_STAGES)[number]['id'];
  setActiveStage: (id: (typeof FLOW_STAGES)[number]['id']) => void;
  flowStep: number;
  title: string;
  icon: React.ReactNode;
  intro: string;
  bullets: string[];
  outcome: string;
  outcomeBullets?: string[];
  tail?: string;
  accent: Accent;
}) {
  const classes = accentClasses[accent];
  return (
    <motion.div
      id={stageId}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      onViewportEnter={() => setActiveStage(stageId)}
      className="flow-stage"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
          {flowStep}
        </span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Step {flowStep} of 6
        </span>
      </div>
      <motion.div
        className={`p-8 rounded-2xl border ${classes.bg} ${classes.border}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/80">{icon}</div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-4">{intro}</p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="text-gray-800 font-medium mb-2">{outcome}</p>
        {outcomeBullets && (
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-2">
            {outcomeBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
        {tail && <p className="text-gray-600 mt-2">{tail}</p>}
      </motion.div>
    </motion.div>
  );
}
