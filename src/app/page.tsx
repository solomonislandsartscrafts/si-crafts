import Link from 'next/link';
import Image from 'next/image';
import { generatePageMetadata } from '@/lib/metadata';
import { getPublicProducts } from '@/services/products';
import { getPublicMakers } from '@/services/makers';
import { getPublishedArticles } from '@/services/articles';
import { ProductCard } from '@/components/cards/product-card';
import { HeroCodeToggle } from '@/components/shared/hero-code-toggle';
import { HeroSlideshow } from '@/components/shared/hero-slideshow';
import { AnimatedStats } from '@/components/shared/animated-stats';

export const metadata = generatePageMetadata({
  title: 'Solomon Islands Arts and Crafts',
  description:
    'Authentic Solomon Islands handicrafts. Meet the makers behind every piece of pandanus weaving, wood carving, and shell-money jewellery.',
  path: '/',
});

export default async function HomePage() {
  const [products, makers, articles] = await Promise.all([
    getPublicProducts(),
    getPublicMakers(),
    getPublishedArticles(),
  ]);

  const featuredProducts = products.slice(0, 4);
  const sampleProductCode = products[0]?.productCode;
  const latestArticles = articles.slice(0, 3);
  const featuredMakers = makers.slice(0, 3);

  // Slideshow images for hero
  const heroSlides = [
    { imageUrl: '/images/pandanus/shoulder bag natural dye.jpg', name: 'Shoulder Bag' },
    { imageUrl: '/images/shell/intricate necklace modelled.jpg', name: 'Intricate Necklace' },
    { imageUrl: '/images/wood/Bowl long Percy.jpg', name: 'Oval Bowl with Inlay' },
    { imageUrl: '/images/pandanus/woven fans.jpg', name: 'Woven Fans' },
    { imageUrl: '/images/bushtwine/tray small 40cm.jpg', name: 'Bush-Twine Tray' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero — Split layout: text left, image right */}
      <section className="bg-sand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
            {/* Left: Text content */}
            <div className="order-2 lg:order-1">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-deep-blue leading-tight uppercase tracking-wide">
                Meet the Makers Behind<br className="hidden sm:block" /> Every Piece
              </h1>
              <p className="mt-4 text-base sm:text-lg text-warm-gray-600 leading-relaxed max-w-md">
                Every product is handmade. When you buy from us, you invest directly in Solomon Islands artisans, their communities, their traditions, and their futures.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalogue"
                  className="tap-target inline-flex items-center px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
                >
                  Browse Catalogue
                </Link>
                <Link
                  href="/about"
                  className="tap-target inline-flex items-center px-6 py-3 border-2 border-warm-gray-800 text-warm-gray-800 hover:bg-warm-gray-800 hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                >
                  Our Story
                </Link>
              </div>
              <div className="mt-4">
                <HeroCodeToggle />
              </div>
            </div>

            {/* Right: Product slideshow */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg order-1 lg:order-2">
              <HeroSlideshow items={heroSlides} interval={4000} />
            </div>
          </div>
        </div>

        {/* Stats bar — animated on scroll */}
        <div className="bg-sand-light border-t border-sand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedStats stats={[
              { value: 'EST. 2026', label: 'Volunteer-Run' },
              { value: String(makers.length), label: 'Solomon Islands Makers' },
              { value: '100% HANDMADE', label: 'In Solomon Islands' },
              { value: 'AVAILABLE IN', label: 'Australia' },
            ]} />
          </div>
        </div>
      </section>

      {/* Featured Makers — the emotional hook */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
              The people behind the pieces
            </h2>
            <p className="text-warm-gray-600 mt-2 max-w-lg mx-auto">
              Every piece you see here was made by hand, by a named maker, in Solomon Islands.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMakers.map((maker, index) => (
              <Link key={maker.id} href={`/maker/${maker.slug}`} className={`group block ${index > 0 ? 'hidden sm:block' : ''} ${index > 1 ? 'sm:hidden lg:block' : ''}`}>
                <div className="aspect-[4/5] relative overflow-hidden rounded-lg bg-sand-light">
                  {maker.portraitUrl && (
                    <Image
                      src={maker.portraitUrl}
                      alt={maker.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  {/* Gradient overlay at bottom for text readability */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-heading text-lg font-bold text-white">
                      {maker.name}
                    </h3>
                    <p className="text-sm text-white/80">
                      {maker.village}, {maker.province}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/makers"
              className="tap-target inline-flex items-center gap-2 px-6 py-3 border-2 border-ocean text-ocean hover:bg-ocean hover:text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
            >
              Meet all makers
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 md:py-20 bg-sand-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
                Featured Crafts
              </h2>
              <p className="text-warm-gray-600 mt-1">
                Handmade pieces from across Solomon Islands.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => {
              const maker = makers.find((m) => m.id === product.makerId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  makerName={maker?.name}
                />
              );
            })}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link href="/catalogue" className="inline-flex items-center gap-1 text-sm font-medium text-ocean">
              View all products
            </Link>
          </div>
        </div>
      </section>

      {/* Every tag tells a story — split image + text */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="hidden md:block relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-lg bg-sand-light">
              {featuredMakers[0]?.portraitUrl && (
                <Image
                  src={featuredMakers[0].portraitUrl}
                  alt={featuredMakers[0].name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            <div className="max-w-md">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue mb-4">
                Every tag tells a story
              </h2>
              <p className="text-warm-gray-600 leading-relaxed mb-4">
                Scan the QR code on any product tag to meet the maker — see who made your piece,
                how it was made, and where it comes from. No app needed, no login required.
              </p>
              <p className="text-warm-gray-600 leading-relaxed mb-6">
                We work directly with makers in Solomon Islands. Every piece carries the artisan&apos;s name,
                village, and story — connecting you to the person and place behind your purchase.
              </p>
              {sampleProductCode && (
                <Link
                  href={`/piece/${sampleProductCode}`}
                  className="tap-target inline-flex items-center gap-2 px-5 py-3 bg-ocean hover:bg-ocean-dark text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-light"
                >
                  See an example tag
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale CTA — with background image */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/P4.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-deep-blue/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            Stock SI Crafts in your shop
          </h2>
          <p className="text-white/70 leading-relaxed mb-6 max-w-xl mx-auto">
            We supply museum shops and galleries in Australia with authentic
            Solomon Islands handicrafts at wholesale prices.
          </p>
          <Link
            href="/wholesale"
            className="tap-target inline-flex items-center gap-2 px-8 py-4 bg-terracotta hover:bg-terracotta-dark text-white rounded-md font-medium text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-light"
          >
            Learn about wholesale
          </Link>
        </div>
      </section>

      {/* Latest News */}
      {latestArticles.length > 0 && (
        <section className="py-10 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-blue">
                Latest news
              </h2>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ocean hover:text-ocean-dark transition-colors"
              >
                All articles
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                  {article.coverImageUrl && (
                    <div className="aspect-[3/2] relative overflow-hidden rounded-lg bg-sand-light mb-3">
                      <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <p className="text-xs text-warm-gray-400 mb-1">
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                  <h3 className="font-heading text-lg font-bold text-deep-blue group-hover:text-ocean transition-colors mb-1 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-warm-gray-600 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
