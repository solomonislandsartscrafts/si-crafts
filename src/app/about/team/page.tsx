import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { TeamList } from './team-list';

export const metadata = generatePageMetadata({
  title: 'Our Team',
  description: 'Meet the volunteer team behind Solomon Islands Arts and Crafts.',
  path: '/about/team',
});

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Our Team"
        intro="Solomon Islands Arts and Crafts is run entirely by volunteers who share a connection to Solomon Islands."
        eyebrow={
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-sm text-ocean hover:text-ocean-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to About
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <TeamList />
      </div>
    </div>
  );
}
