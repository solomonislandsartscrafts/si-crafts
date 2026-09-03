import { generatePageMetadata } from '@/lib/metadata';
import { PageHeader } from '@/components/layout';
import { TeamList } from './team-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getSiteTextSafe } from '@/services/site-text';

export const metadata = generatePageMetadata({
  title: 'Our Team',
  description: 'Meet the volunteer team behind Solomon Islands Arts & Crafts.',
  path: '/about/team',
});

export default async function TeamPage() {
  const text = await getSiteTextSafe();

  return (
    <div>
      <PageHeader
        title={text['aboutTeam.title']}
        intro={text['aboutTeam.intro']}
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

      <div className="site-container pb-section">
        <TeamList
          emptyTitle={text['aboutTeam.emptyTitle']}
          emptyDescription={text['aboutTeam.emptyDescription']}
        />
      </div>
    </div>
  );
}
