'use client';

import { useState, useEffect } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import type { TeamMember } from '@/types';

export function TeamList() {
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
      <div className="space-y-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-6 items-start animate-pulse">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sand-light flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="h-5 bg-sand-light rounded w-32" />
              <div className="h-3 bg-sand-light rounded w-24" />
              <div className="h-3 bg-sand-light rounded w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return <p className="text-warm-gray-400 italic">Team information coming soon.</p>;
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
      ))}
    </div>
  );
}
