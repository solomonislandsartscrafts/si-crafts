import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { TeamList } from './team-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export const metadata = generatePageMetadata({
  title: 'Our Team',
  description: 'Meet the volunteer team behind Solomon Islands Arts Crafts.',
  path: '/about/team',
});

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Our Team"
        intro="Solomon Islands Arts Crafts is run entirely by volunteers who share a connection to Solomon Islands."
        eyebrow={
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'About', url: '/about' },
              { name: 'Team' },
            ]}
          />
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
        <TeamList />
      </div>
    </div>
  );
}
