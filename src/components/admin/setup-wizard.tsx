'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { SetupProgress } from '@/types';
import { buildSetupSteps } from './setup-steps';

interface SetupWizardProps {
  progress: SetupProgress;
}

/**
 * The setup checklist on the Getting Started page.
 * A simple ordered list of steps — no progress tracking or "done" states.
 * Each step is a card that links to the relevant admin page.
 */
export function SetupWizard({ progress }: SetupWizardProps) {
  const steps = buildSetupSteps(progress);

  return (
    <ol className="space-y-xs">
      {steps.map((step) => {
        const Icon = step.icon;

        return (
          <li key={step.number}>
            <Link
              href={step.href}
              className="group block rounded-lg border border-sand bg-white p-sm hover:border-ocean hover:bg-ocean/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-xs sm:gap-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ocean/10 text-ocean flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2xs">
                    <Icon
                      className="w-4 h-4 flex-shrink-0 text-ocean"
                      aria-hidden="true"
                    />
                    <h3 className="font-heading text-base font-semibold text-deep-blue">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-base text-warm-gray-600 mt-3xs leading-body">{step.description}</p>
                  {step.prerequisite && (
                    <p className="text-base text-warm-gray-400 mt-3xs italic">{step.prerequisite}</p>
                  )}
                </div>

                <div className="flex-shrink-0 self-center">
                  <span className="inline-flex items-center gap-3xs text-sm font-medium text-ocean group-hover:text-ocean-dark transition-colors">
                    Go to
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
