import { redirect } from 'next/navigation';

interface ShortUrlPageProps {
  params: Promise<{ productCode: string }>;
}

export default async function ShortUrlPage({ params }: ShortUrlPageProps) {
  const { productCode } = await params;
  redirect(`/piece/${productCode}`);
}
