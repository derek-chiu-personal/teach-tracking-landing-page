'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LeadForm from '@/components/LeadForm';
import CalendarWidget from '@/components/CalendarWidget';
import { AnimatePresence, motion } from 'framer-motion';
import teacherDashboardImg from '@/img/teacher-dashboard.png';
import teacherIepImg from '@/img/teacher-iep.png';
import teacherAccommodationsImg from '@/img/teacher-accommodations.png';

export default function Home() {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadEmail, setLeadEmail] = useState<string | null>(null);
  const [leadName, setLeadName] = useState<string | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);

  const handleLeadSuccess = (id: string, email: string, firstName: string, district?: string) => {
    setLeadId(id);
    setLeadEmail(email);
    setLeadName(firstName);
    setDistrictName(district || null);
  };

  return (
    <main>
      <Navbar />
      <Hero />

      {/* How It Works teaser (slim, visual, large images) */}
      <section className="py-16 bg-gradient-to-b from-sky-50 via-sky-50/60 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                How TeachTracker Works in Practice
              </h2>
              <p className="text-gray-600">
                A quick visual pass through what case managers and leaders actually see in the product.
              </p>
            </div>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors self-start md:self-auto"
            >
              See the full walkthrough
            </a>
          </div>

          <div className="space-y-16">
            {/* Block 1: Image then prompt (image left on desktop) */}
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-8">
              <div className="relative w-full md:w-2/3 aspect-[16/9] max-h-[440px] rounded-[32px] bg-slate-900 shadow-2xl border border-slate-900/60 overflow-hidden">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full bg-slate-800" />
                <div className="absolute inset-4 rounded-[24px] bg-slate-950 overflow-hidden">
                  <Image
                    src={teacherDashboardImg}
                    alt="TeachTracker dashboard showing caseload and compliance status"
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              </div>
              <div className="space-y-2 md:w-1/3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Step 1 · See the district
                </p>
                <h3 className="text-base font-semibold text-gray-900">
                  District-wide visibility
                </h3>
                <p className="text-sm text-gray-600">
                  Deadlines, caseloads, and risk in a single dashboard.
                </p>
              </div>
            </div>

            {/* Block 2: Prompt then image (prompt left, image right on desktop) */}
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-8">
              <div className="space-y-2 md:w-1/3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Step 2 · Draft the plan
                </p>
                <h3 className="text-base font-semibold text-gray-900">
                  Structured IEP creation
                </h3>
                <p className="text-sm text-gray-600">
                  Guided IEP layout with built-in compliance checks.
                </p>
              </div>
              <div className="relative w-full md:w-2/3 aspect-[16/9] max-h-[440px] rounded-[32px] bg-slate-900 shadow-2xl border border-slate-900/60 overflow-hidden">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full bg-slate-800" />
                <div className="absolute inset-4 rounded-[24px] bg-slate-950 overflow-hidden">
                  <Image
                    src={teacherIepImg}
                    alt="TeachTracker IEP editing screen with structured fields"
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              </div>
            </div>

            {/* Block 3: Image then prompt (image left on desktop) */}
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-8">
              <div className="relative w-full md:w-2/3 aspect-[16/9] max-h-[440px] rounded-[32px] bg-slate-900 shadow-2xl border border-slate-900/60 overflow-hidden">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full bg-slate-800" />
                <div className="absolute inset-4 rounded-[24px] bg-slate-950 overflow-hidden">
                  <Image
                    src={teacherAccommodationsImg}
                    alt="TeachTracker accommodations view connecting teachers and students"
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </div>
              </div>
              <div className="space-y-2 md:w-1/3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Step 3 · Share with classrooms
                </p>
                <h3 className="text-base font-semibold text-gray-900">
                  Classroom-ready accommodations
                </h3>
                <p className="text-sm text-gray-600">
                  Clear accommodations view for classroom teachers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Core Pillars
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Compliance
              </h3>
              <p className="text-gray-600">
                Automated guardrails ensure every IEP meets legal requirements.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-indigo-50 border border-indigo-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Collaboration
              </h3>
              <p className="text-gray-600">
                Parent-teacher-admin synced views keep everyone aligned.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-purple-50 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Data
              </h3>
              <p className="text-gray-600">
                Real-time student progress tracking drives better outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            What Educators Are Saying
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "teachtracker has transformed how we handle compliance. What used to take hours now takes minutes, and we have complete confidence in our documentation."
              </blockquote>
              <cite className="text-sm font-medium text-gray-900">
                — Sarah Johnson, Special Ed Director
              </cite>
            </div>
            
            <div className="p-8 bg-white rounded-2xl shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-gray-600 mb-4">
                "The parent collaboration features are game-changing. We're now able to keep everyone aligned and students are getting the support they need faster than ever."
              </blockquote>
              <cite className="text-sm font-medium text-gray-900">
                — Michael Chen, District Administrator
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form & Calendar Section */}
      <section id="book-demo" className="py-24 bg-gray-900">
        <div className="max-w-xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {!leadId ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Transform Your IEP Process?
                  </h2>
                  <p className="text-gray-400">
                    Schedule a personalized demo with our team.
                  </p>
                </div>
                <div className="p-8 rounded-2xl bg-gray-800 border border-gray-700">
                  <LeadForm onSuccess={handleLeadSuccess} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="calendar-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <CalendarWidget 
                  leadEmail={leadEmail || undefined} 
                  leadName={leadName || undefined}
                  leadId={leadId || undefined}
                  districtName={districtName || undefined}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2026 teachtracker. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
