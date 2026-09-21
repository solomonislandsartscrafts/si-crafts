'use client';

import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Faq } from '@/types';

/**
 * The FAQ accordion.
 *
 * This intentionally does NOT reuse the shared <AccordionItem>. That component
 * renders its trigger as a tiny-caps `text-xs uppercase` LABEL — correct for
 * the product page's short "Product details" / "How it's made" panels, but
 * wrong for a whole page of real questions, which are prose and belong on the
 * 16px readable-text floor. Here each question is a sentence-case heading a
 * visitor reads, so it gets `text-base`/`text-lg` weight, not a metadata label.
 *
 * Accessibility matches the shared component: the trigger is a <button> inside
 * an <h3> (so each question is a stop in heading navigation), wired with
 * `aria-expanded` / `aria-controls` to a `role="region"` body that is unmounted
 * when closed.
 */
export function FaqsAccordion({ faqs }: { faqs: Faq[] }) {
  // Column is capped for a comfortable reading measure but LEFT-aligned to sit
  // under the (left-aligned) page header, rather than `mx-auto` which floated
  // it to the middle of the full-width container with a large empty gutter.
  return (
    <ul className="max-w-3xl space-y-xs">
      {faqs.map((faq) => (
        <li key={faq.id}>
          <FaqRow question={faq.question} answer={faq.answer} />
        </li>
      ))}
    </ul>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const headerId = `faq-header-${uid}`;
  const panelId = `faq-panel-${uid}`;

  // Answers are plain text from the admin; blank lines separate paragraphs.
  // A single newline that merely wraps a line stays within the same paragraph
  // (its newlines collapse to spaces).
  const paragraphs = answer
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

  return (
    <div
      className={`overflow-hidden rounded-lg border transition-colors ${
        open ? 'border-ocean/40 bg-white shadow-card' : 'border-sand bg-white'
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          id={headerId}
          className="tap-target flex w-full cursor-pointer items-center justify-between gap-sm px-sm py-sm text-left transition-colors hover:bg-sand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean sm:px-md"
        >
          <span className="font-heading text-base sm:text-lg font-semibold text-deep-blue leading-title-sm">
            {question}
          </span>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-ocean transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="border-t border-sand px-sm pb-sm pt-xs sm:px-md"
        >
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="text-base text-warm-gray-600 leading-body [&:not(:first-child)]:mt-xs"
            >
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
