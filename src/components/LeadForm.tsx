'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Calendar, ChevronDown } from 'lucide-react';
import { useAttribution } from '@/hooks/useAttribution';
import { useGhostId } from '@/hooks/useGhostId';

const jobTitles = [
  'Administrator',
  'Special Ed Coordinator',
  'Teacher',
  'IT/Operations',
  'Other',
] as const;

const leadFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  job_title: z.enum(jobTitles, { errorMap: () => ({ message: 'Please select your role' }) }),
  district_name: z.string().min(1, 'District name is required'),
  school_name: z.string().optional(),
  phone_number: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  onSuccess?: (leadId: string, email: string, firstName: string, districtName?: string) => void;
}

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [leadData, setLeadData] = useState<{ id: string; email: string; firstName: string } | null>(null);

  const { getAttribution } = useAttribution();
  const { getGhostId } = useGhostId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const attribution = getAttribution();
      const ghostId = getGhostId();

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ghost_id: ghostId || undefined,
          attribution: Object.keys(attribution).length > 0 ? attribution : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setLeadData({
        id: result.lead_id,
        email: data.email,
        firstName: data.first_name,
      });
      setIsSuccess(true);
      
      if (onSuccess) {
        onSuccess(result.lead_id, data.email, data.first_name, data.district_name);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  {...register('first_name')}
                  type="text"
                  id="first_name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  {...register('last_name')}
                  type="text"
                  id="last_name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Work Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@district.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-300 mb-1">
                Your Role *
              </label>
              <div className="relative">
                <select
                  {...register('job_title')}
                  id="job_title"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>Select your role...</option>
                  {jobTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.job_title && (
                <p className="mt-1 text-sm text-red-400">{errors.job_title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="district_name" className="block text-sm font-medium text-gray-300 mb-1">
                School District *
              </label>
              <input
                {...register('district_name')}
                type="text"
                id="district_name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ABC Unified School District"
              />
              {errors.district_name && (
                <p className="mt-1 text-sm text-red-400">{errors.district_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="school_name" className="block text-sm font-medium text-gray-300 mb-1">
                School Name (Optional)
              </label>
              <input
                {...register('school_name')}
                type="text"
                id="school_name"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Lincoln High School"
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone_number')}
                type="tel"
                id="phone_number"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>

            {submitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request a Demo'
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Thanks, {leadData?.firstName}!
            </h3>
            <p className="text-gray-400 mb-6">
              Let's pick a time for your personalized demo.
            </p>
            <div className="inline-flex items-center gap-2 text-blue-400">
              <Calendar className="w-5 h-5" />
              <span>Calendar loading below...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
