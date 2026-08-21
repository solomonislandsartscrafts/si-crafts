'use client';

import { useState, useEffect } from 'react';
import { Save, Tag, User, Hammer, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin';
import { SafeImage } from '@/components/ui/safe-image';
import { useToast } from '@/components/ui/toast';
import { pageTitleClasses } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { inputClasses } from '@/components/ui/form-field';
import { SkeletonText } from '@/components/ui/skeleton';
import {
  getSlideshowProductCandidates,
  getSlideshowMakerCandidates,
  getSlideshowCraftCandidates,
} from '@/lib/slideshow-candidates';
import type { Product, Maker, Craft, SlideshowSettings, SlideItemToggle, SlideCategory } from '@/types';

const DEFAULT_SETTINGS: SlideshowSettings = {
  enabledCategories: { product: true, maker: true, craft: true },
  items: [],
};

const CATEGORY_META: Record<SlideCategory, { label: string; icon: typeof Tag; color: string }> = {
  product: { label: 'Products', icon: Tag, color: 'bg-brand-green' },
  maker: { label: 'Makers', icon: User, color: 'bg-ocean' },
  craft: { label: 'Crafts', icon: Hammer, color: 'bg-deep-blue' },
};

export default function AdminSlideshowPage() {
  const [settings, setSettings] = useState<SlideshowSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [makers, setMakers] = useState<Maker[]>([]);
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [
          { getSlideshowSettings },
          { getAllProducts },
          { getAllMakers },
          { getAllCrafts },
        ] = await Promise.all([
          import('@/services/slideshow'),
          import('@/services/products'),
          import('@/services/makers'),
          import('@/services/crafts'),
        ]);

        const [savedSettings, allProducts, allMakers, allCrafts] = await Promise.all([
          getSlideshowSettings(),
          getAllProducts(),
          getAllMakers(),
          getAllCrafts(),
        ]);

        setSettings(savedSettings);
        setProducts(getSlideshowProductCandidates(allProducts));
        setMakers(getSlideshowMakerCandidates(allMakers));
        setCrafts(getSlideshowCraftCandidates(allCrafts));
      } catch {
        toastError('Failed to load slideshow settings.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggleCategory(category: SlideCategory) {
    setSettings((prev) => ({
      ...prev,
      enabledCategories: {
        ...prev.enabledCategories,
        [category]: !prev.enabledCategories[category],
      },
    }));
  }

  function isItemEnabled(id: string, kind: SlideCategory): boolean {
    const item = settings.items.find((i) => i.id === id && i.kind === kind);
    // If no explicit toggle exists, default to enabled
    return item ? item.enabled : true;
  }

  function toggleItem(id: string, kind: SlideCategory) {
    setSettings((prev) => {
      const existing = prev.items.find((i) => i.id === id && i.kind === kind);
      let newItems: SlideItemToggle[];
      if (existing) {
        newItems = prev.items.map((i) =>
          i.id === id && i.kind === kind ? { ...i, enabled: !i.enabled } : i
        );
      } else {
        // First toggle: item was implicitly enabled, so set to disabled
        newItems = [...prev.items, { id, kind, enabled: false }];
      }
      return { ...prev, items: newItems };
    });
  }

  function getItemPosition(id: string, kind: SlideCategory): string {
    const item = settings.items.find((i) => i.id === id && i.kind === kind);
    return item?.objectPosition || 'center';
  }

  function setItemPosition(id: string, kind: SlideCategory, position: string) {
    setSettings((prev) => {
      const existing = prev.items.find((i) => i.id === id && i.kind === kind);
      let newItems: SlideItemToggle[];
      if (existing) {
        newItems = prev.items.map((i) =>
          i.id === id && i.kind === kind ? { ...i, objectPosition: position } : i
        );
      } else {
        // Item has no toggle yet — create one (enabled by default) with the position
        newItems = [...prev.items, { id, kind, enabled: true, objectPosition: position }];
      }
      return { ...prev, items: newItems };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { updateSlideshowSettings } = await import('@/services/slideshow');
      await updateSlideshowSettings(settings);
      toastSuccess('Slideshow settings saved.');
    } catch {
      toastError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl py-8">
          <SkeletonText lines={8} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={pageTitleClasses}>Homepage Slideshow</h1>
            <p className="text-base text-warm-gray-600 mt-1">
              Control which categories and items appear in the homepage hero slideshow.
            </p>
          </div>
          <Button onClick={handleSave} loading={saving} loadingText="Saving...">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>

        {/* Category toggles */}
        <section className="border border-sand rounded-lg p-6 mb-6">
          <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">Category Toggles</h2>
          <p className="text-base text-warm-gray-400 mb-4">
            Enable or disable entire categories. Disabled categories won&apos;t appear in the slideshow at all.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.keys(CATEGORY_META) as SlideCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const enabled = settings.enabledCategories[cat];
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  aria-pressed={enabled}
                  className={`tap-target flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                    enabled
                      ? 'border-ocean bg-ocean/5'
                      : 'border-sand-dark bg-warm-gray-100 opacity-60'
                  }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full ${meta.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-sm font-medium text-deep-blue">{meta.label}</span>
                  <span className="ml-auto">
                    {enabled ? (
                      <Eye className="w-4 h-4 text-ocean" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-warm-gray-400" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Per-item toggles — Products */}
        {settings.enabledCategories.product && (
          <ItemSection
            title="Products"
            description="Toggle individual products on or off in the slideshow."
            items={products.map((p) => ({
              id: p.id,
              kind: 'product' as SlideCategory,
              label: p.name,
              subtitle: p.materialCategory,
              imageUrl: p.imageUrls[0] || null,
            }))}
            isItemEnabled={isItemEnabled}
            toggleItem={toggleItem}
            setItemPosition={setItemPosition}
            getItemPosition={getItemPosition}
          />
        )}

        {/* Per-item toggles — Makers */}
        {settings.enabledCategories.maker && (
          <ItemSection
            title="Makers"
            description="Toggle individual makers on or off in the slideshow."
            items={makers.map((m) => ({
              id: m.id,
              kind: 'maker' as SlideCategory,
              label: m.name,
              subtitle: `${m.village}, ${m.province}`,
              imageUrl: m.portraitUrl,
            }))}
            isItemEnabled={isItemEnabled}
            toggleItem={toggleItem}
            setItemPosition={setItemPosition}
            getItemPosition={getItemPosition}
          />
        )}

        {/* Per-item toggles — Crafts */}
        {settings.enabledCategories.craft && (
          <ItemSection
            title="Crafts"
            description="Toggle individual crafts on or off in the slideshow."
            items={crafts.map((c) => ({
              id: c.id,
              kind: 'craft' as SlideCategory,
              label: c.name,
              subtitle: c.materialCategory,
              imageUrl: c.processImageUrls[0] || null,
            }))}
            isItemEnabled={isItemEnabled}
            toggleItem={toggleItem}
            setItemPosition={setItemPosition}
            getItemPosition={getItemPosition}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// --- Item Section ---

interface ItemDisplay {
  id: string;
  kind: SlideCategory;
  label: string;
  subtitle: string;
  imageUrl: string | null;
  objectPosition?: string;
}

interface ItemSectionProps {
  title: string;
  description: string;
  items: ItemDisplay[];
  isItemEnabled: (id: string, kind: SlideCategory) => boolean;
  toggleItem: (id: string, kind: SlideCategory) => void;
  setItemPosition: (id: string, kind: SlideCategory, position: string) => void;
  getItemPosition: (id: string, kind: SlideCategory) => string;
}

function ItemSection({ title, description, items, isItemEnabled, toggleItem, setItemPosition, getItemPosition }: ItemSectionProps) {
  if (items.length === 0) {
    return (
      <section className="border border-sand rounded-lg p-6 mb-6">
        <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">{title}</h2>
        <p className="text-base text-warm-gray-400">No {title.toLowerCase()} with images available.</p>
      </section>
    );
  }

  return (
    <section className="border border-sand rounded-lg p-6 mb-6">
      <h2 className="font-heading text-lg font-semibold text-deep-blue mb-1">{title}</h2>
      <p className="text-base text-warm-gray-400 mb-4">{description}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const enabled = isItemEnabled(item.id, item.kind);
          const position = getItemPosition(item.id, item.kind);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                enabled
                  ? 'border-sand bg-white'
                  : 'border-sand-dark bg-warm-gray-100 opacity-50'
              }`}
            >
              {/* Toggle button */}
              <button
                onClick={() => toggleItem(item.id, item.kind)}
                aria-pressed={enabled}
                className="tap-target flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded overflow-hidden bg-sand-light flex-shrink-0 relative">
                  <SafeImage
                    src={item.imageUrl}
                    alt={item.label}
                    fill
                    className="object-cover"
                    style={{ objectPosition: position }}
                    sizes="40px"
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-deep-blue truncate">{item.label}</p>
                  <p className="text-xs text-warm-gray-600 truncate capitalize">{item.subtitle}</p>
                </div>
                {/* Toggle indicator */}
                <span className="flex-shrink-0">
                  {enabled ? (
                    <Eye className="w-4 h-4 text-ocean" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-warm-gray-400" />
                  )}
                </span>
              </button>
              {/* Focal point selector */}
              {enabled && (
                <select
                  value={position}
                  onChange={(e) => setItemPosition(item.id, item.kind, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`${inputClasses} flex-shrink-0 max-w-40`}
                  aria-label={`Image focal point for ${item.label}`}
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top left">Top Left</option>
                  <option value="top right">Top Right</option>
                  <option value="bottom left">Bottom Left</option>
                  <option value="bottom right">Bottom Right</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
