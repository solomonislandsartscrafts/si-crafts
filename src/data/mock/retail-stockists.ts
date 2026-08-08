import type { RetailStockist } from '@/types';

export const mockRetailStockists: RetailStockist[] = [
  {
    city: 'Brisbane',
    name: 'QAGOMA Queensland Art Gallery of Modern Art',
    url: 'https://qagoma.store/',
    address: 'Stanley Place, South Brisbane Queensland 4101, Australia',
    phone: '+61 (0)7 3840 7290',
    email: 'qagomastore@qagoma.qld.gov.au',
    hours: 'Open Daily 10am–5pm',
    closed: 'Closed Good Friday, Christmas Day, Boxing Day',
  },
  {
    city: 'Sydney',
    name: 'Australian Museum',
    url: 'https://australian.museum/visit/shop/',
    address: '1 William Street Sydney NSW 2010, Australia',
    phone: '+61 (0)2 9320 6150',
    email: 'shop@australian.museum',
    hours: 'Open Daily 10am–5pm',
    closed: 'Closed Christmas Day',
  },
];
