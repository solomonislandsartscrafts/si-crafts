import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';

export const metadata = generatePageMetadata({
  title: 'Our Team',
  description: 'Meet the volunteer team behind Solomon Islands Arts and Crafts.',
  path: '/about/team',
});

const TEAM_MEMBERS = [
  {
    name: 'Alison Wishart',
    location: 'Sydney, Australia',
    bio: 'Alison was born near Munda in Western Province. In 2025, she went to Honiara with the Australian Volunteers Program and worked with makers and artisans at the Solomon Islands National Art Gallery for six months. She is responsible for importing, documentation, liaising with makers and stockists, and day-to-day operations.',
    aviLink: 'https://www.australianvolunteers.com/',
    photoUrl: null,
  },
  {
    name: 'Isaac Tekulu',
    location: 'Dunedin, New Zealand',
    bio: null, // To be completed
    photoUrl: null,
  },
  {
    name: 'Graphic Designer',
    location: null,
    bio: 'Our graphic designer who designed the SIAC logo and branding.',
    photoUrl: null,
  },
  {
    name: 'Photographer',
    location: null,
    bio: 'Our photographer who captures the crafts and makers.',
    photoUrl: null,
  },
];

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 space-y-10">
        {TEAM_MEMBERS.map((member) => (
          <div key={member.name} className="flex gap-6 items-start">
            {/* Photo placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sand flex-shrink-0 flex items-center justify-center overflow-hidden">
              {member.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-contain p-4" />
              ) : (
                <span className="text-warm-gray-400 text-xs text-center">Photo</span>
              )}
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
                  {member.aviLink && (
                    <>
                      {' '}
                      <a
                        href={member.aviLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ocean hover:text-ocean-dark"
                      >
                        Australian Volunteers Program
                      </a>
                    </>
                  )}
                </p>
              ) : (
                <p className="text-warm-gray-400 italic text-sm">Bio coming soon.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
