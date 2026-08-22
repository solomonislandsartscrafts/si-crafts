'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonRegion } from '@/components/ui/skeleton';
import type { TeamMember } from '@/types';

export function TeamList({
  emptyTitle,
  emptyDescription,
}: {
  emptyTitle: string;
  emptyDescription: string;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { getTeamMembers } = await import('@/services/team');
        const data = await getTeamMembers();
        setMembers(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SkeletonRegion label="Loading team">
        <div className="space-y-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6 items-start">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonRegion>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState icon={Users} title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="space-y-10">
      {members.map((member) => (
        <div key={member.id} className="flex gap-6 items-start">
          {/* Photo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sand-light flex-shrink-0 relative overflow-hidden">
            <SafeImage
              src={member.photoUrl || null}
              alt={member.photoAlt || member.name}
              fill
              className="object-cover"
              style={member.photoPosition ? { objectPosition: member.photoPosition } : undefined}
              sizes="96px"
            />
          </div>

          {/* Info. h3, not h2 — this list sits under the page's own h1, and a
              team member is a card within the page, not a section of it. */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-deep-blue">
              {member.name}
            </h3>
            {member.location && (
              <p className="text-sm text-warm-gray-400 mb-2">{member.location}</p>
            )}
            {member.bio ? (
              <p className="text-base text-warm-gray-600 leading-relaxed">
                {member.bio}
              </p>
            ) : (
              <p className="text-base text-warm-gray-400 italic">Bio coming soon.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
