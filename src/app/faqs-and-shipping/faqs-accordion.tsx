'use client';

import { AccordionItem } from '@/components/ui/accordion';
import type { Faq } from '@/types';

export function FaqsAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="max-w-3xl mx-auto">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} title={faq.question}>
          {/* Answers are plain text from the admin; blank lines separate
              paragraphs. Split on blank lines only, so a single newline that
              merely wraps a line stays within the same paragraph (its newlines
              collapse to spaces). */}
          {faq.answer
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p
                key={i}
                className="text-base text-warm-gray-600 leading-relaxed [&:not(:first-child)]:mt-3"
              >
                {paragraph}
              </p>
            ))}
        </AccordionItem>
      ))}
    </div>
  );
}
