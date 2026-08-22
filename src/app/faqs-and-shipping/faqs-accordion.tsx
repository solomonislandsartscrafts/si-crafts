'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/types';

export function FaqsAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-2">
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
      <button
        onClick={() => setOpen(!open)}
        className="tap-target w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus:outline-none focus:ring-2 focus:ring-ocean rounded-lg"
        aria-expanded={open}
      >
        <span className="font-heading text-base font-semibold text-deep-blue">
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-warm-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
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
