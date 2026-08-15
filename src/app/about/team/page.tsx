import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { getTeamMembers } from '@/services/team';
import { SafeImage } from '@/components/ui/safe-image';

export const metadata = generatePageMetadata({
  title: 'Our Team',
  description: 'Meet the volunteer team behind Solomon Islands Arts and Crafts.',
  path: '/about/team',
});

export default async function TeamPage() {
  const members = await getTeamMembers();

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 space-y-10">
        {members.length === 0 ? (
          <p className="text-warm-gray-400 italic">Team information coming soon.</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex gap-6 items-start">
              {/* Photo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sand-light flex-shrink-0 relative overflow-hidden">
                <SafeImage
                  src={member.photoUrl || null}
                  alt={member.photoAlt || member.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>

              {/* Info */}
              <div>
                <h2 className="font-heading text-lg font-semibold text-deep-blue">
                  {member.name}
                </h2>
                {member.location && (
                  <p className="text-sm text-warm-gray-400 mb-2">{member.location}</p>
                )}
                {member.bio ? (
                  <p className="text-sm text-warm-gray-600 leading-relaxed">
                    {member.bio}
                  </p>
                ) : (
                  <p className="text-warm-gray-400 italic text-sm">Bio coming soon.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
