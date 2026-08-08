'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import type { SetupProgress } from '@/types';
import { buildSetupSteps, countComplete } from './setup-steps';

interface SetupProgressCardProps {
  progress: SetupProgress;
}

/**
 * Compact setup status for the dashboard. Shows the next step and a progress
 * bar only — the full checklist and guidance live on /admin/getting-started.
 */
export function SetupProgressCard({ progress }: SetupProgressCardProps) {
  const steps = buildSetupSteps(progress);
  const completedCount = countComplete(steps);
  const nextStep = steps.find((step) => !step.complete);

  return (
    <section className="bg-card-bg rounded-lg shadow-card p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-heading text-lg font-semibold text-deep-blue">Site setup</h2>
        <span className="text-xs text-warm-gray-400">
          {completedCount} of {steps.length}
        </span>
      </div>

      <div className="h-2 bg-sand rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-ocean transition-all duration-500"
          style={{ width: `${(completedCount / steps.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-label="Setup progress"
        />
      </div>

      {nextStep ? (
        <>
          <p className="text-xs text-warm-gray-400 uppercase tracking-wide mb-1">Next step</p>
          <p className="text-sm font-medium text-warm-gray-800 mb-4">{nextStep.title}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={nextStep.href}
              className="tap-target inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-ocean text-white rounded-md hover:bg-ocean-dark transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              Continue
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/admin/getting-started"
              className="tap-target inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-ocean text-ocean rounded-md hover:bg-ocean hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Guide
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-warm-gray-800 mb-4">
            Setup is complete. The guide covers day-to-day editing whenever you need it.
          </p>
          <Link
            href="/admin/getting-started"
            className="tap-target inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 border-ocean text-ocean rounded-md hover:bg-ocean hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            Open the guide
          </Link>
        </>
      )}
    </section>
  );
}
