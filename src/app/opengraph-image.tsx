import { ImageResponse } from 'next/og';

/**
 * Site-wide Open Graph / social share card.
 *
 * Generated from the brand mark rather than a maker photograph: a single
 * site-wide image cannot carry per-maker consent, so we deliberately do not
 * put a maker's face or work on it.
 *
 * Next serves this at /opengraph-image and injects the correct og:image and
 * twitter:image tags automatically, so no metadata.openGraph.images entry is
 * needed for it.
 */
export const alt = 'Solomon Islands Arts Crafts — handmade pandanus weaving, wood carving and shell-money jewellery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFDF8',
          padding: '80px',
        }}
      >
        {/* Flag stripe, matching .flag-divider on the site */}
        <div style={{ display: 'flex', height: 14, width: '100%' }}>
          <div style={{ flex: 1, backgroundColor: '#0051A5' }} />
          <div style={{ width: 24, backgroundColor: '#FFFFFF' }} />
          <div style={{ width: 48, backgroundColor: '#F4B728' }} />
          <div style={{ flex: 1, backgroundColor: '#1E7A3D' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#1E5AA8',
              marginBottom: 24,
            }}
          >
            Handmade in Solomon Islands
          </div>
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.1,
              color: '#1B3A4B',
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            Solomon Islands Arts Crafts
          </div>
          <div style={{ fontSize: 34, lineHeight: 1.4, color: '#5C5648' }}>
            Meet the makers behind every piece — pandanus weaving, wood
            carving, and shell-money jewellery.
          </div>
        </div>

        <div style={{ fontSize: 26, color: '#736B62' }}>
          solomonislandsartsandcrafts.com.au
        </div>
      </div>
    ),
    size
  );
}
