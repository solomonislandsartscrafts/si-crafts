'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/types';

export function FaqsAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-2xs">
      {faqs.map((faq) => (
        <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-sand rounded-lg">
      {/* Wrapping the trigger in a real heading gives each question its own
          stop in heading-based navigation (screen readers' "jump by heading"
          commands) — without it, a long FAQ list was invisible to that
          navigation entirely: the only heading on the page was the sr-only
          section title above the whole list, then nothing. The button itself
          still carries the accordion semantics (aria-expanded); the heading
          just wraps it, the same relationship WAI-ARIA's accordion pattern
          recommends. */}
      <h3>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="tap-target w-full flex items-center justify-between gap-sm px-md py-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean rounded-lg"
          aria-expanded={open}
        >
          <span className="font-heading text-base font-semibold text-deep-blue">
            {question}
          </span>
          <ChevronDown className={`w-5 h-5 text-warm-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      {open && (
        <div className="px-md pb-sm">
          {/* Answers are plain text from the admin; blank lines become paragraphs. */}
          {answer.split('\n').map((line) => line.trim()).filter(Boolean).map((line, i) => (
            <p key={i} className="text-base text-warm-gray-600 leading-relaxed [&:not(:first-child)]:mt-3">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
