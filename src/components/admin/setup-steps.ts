import { Tags, Palette, Users, Package, Newspaper, ImageIcon } from 'lucide-react';
import type { SetupProgress } from '@/types';

export interface SetupStep {
  number: number;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  complete: boolean;
  /** What needs to exist before this step makes sense */
  prerequisite?: string;
}

/**
 * The correct order for building the catalogue. Shared by the dashboard
 * progress card and the Getting Started checklist so they never disagree.
 */
export function buildSetupSteps(progress: SetupProgress): SetupStep[] {
  return [
    {
      number: 1,
      title: 'Set up material categories',
      description:
        'Create the material types your products use (Pandanus, Wood, Shells, Bush-twine). Each category carries the initial used in product codes.',
      href: '/admin/categories',
      icon: Tags,
      complete: progress.categories > 0,
    },
    {
      number: 2,
      title: 'Add crafts and techniques',
      description:
        'Describe each craft tradition — how it is made, which materials it uses, and its cultural context. A craft belongs to one material category.',
      href: '/admin/crafts',
      icon: Palette,
      complete: progress.crafts > 0,
      prerequisite: 'Needs at least one material category',
    },
    {
      number: 3,
      title: 'Add makers',
      description:
        'Create maker profiles with village, province, story and portrait. Record consent before publishing anyone.',
      href: '/admin/makers',
      icon: Users,
      complete: progress.makers > 0,
      prerequisite: 'Needs at least one craft',
    },
    {
      number: 4,
      title: 'Add products',
      description:
        'Add photos, description, dimensions and wholesale price. Each product links to a maker and a craft.',
      href: '/admin/products',
      icon: Package,
      complete: progress.products > 0,
      prerequisite: 'Needs at least one maker and one craft',
    },
    {
      number: 5,
      title: 'Upload site images',
      description: 'Set the About page images. These appear on the public site as soon as they are saved.',
      href: '/admin/site-content',
      icon: ImageIcon,
      complete: progress.siteImages > 0,
    },
    {
      number: 6,
      title: 'Write a news article',
      description: 'Share stories about makers, buying trips or stockist partnerships. Articles appear on the News page.',
      href: '/admin/news',
      icon: Newspaper,
      complete: progress.articles > 0,
    },
  ];
}

export function countComplete(steps: SetupStep[]): number {
  return steps.filter((step) => step.complete).length;
}
