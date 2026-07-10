import { redirect } from 'next/navigation';
import { getAllProducts } from '@/services/products';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ productCode: p.productCode }));
}

interface ShortUrlPageProps {
  params: Promise<{ productCode: string }>;
}

export default async function ShortUrlPage({ params }: ShortUrlPageProps) {
  const { productCode } = await params;
  redirect(`/piece/${productCode}`);
}
