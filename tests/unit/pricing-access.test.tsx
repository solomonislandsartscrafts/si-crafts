/**
 * Who sees wholesale pricing on the public site.
 *
 * Rule: logged-in stockists and logged-in admins see prices; anonymous visitors
 * never do. Order controls (Add to Order) stay stockist-only — admins have no
 * cart. These tests cover the central helper, the hook that validates stored
 * sessions, and the rendered catalogue + banner prompt for all three audiences.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { mockProducts } from '@/data/mock/products';
import { mockMakers } from '@/data/mock/makers';
import { formatPrice } from '@/lib/price';

const validateStockistSession = vi.fn();
const validateAdminSession = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  validateStockistSession: (token: string) => validateStockistSession(token),
  validateAdminSession: (token: string) => validateAdminSession(token),
}));

import { canViewPricing, usePricingAccess } from '@/lib/use-pricing-access';
import { CatalogueClient } from '@/app/catalogue/catalogue-client';
import { StockistBannerPrompt } from '@/components/catalogue/stockist-banner-prompt';

const STOCKIST = { id: 's1', businessName: 'Test Gallery Shop' };
const ADMIN = { id: 'a1', role: 'super_admin' };

function loginAs(who: 'admin' | 'stockist') {
  if (who === 'admin') {
    localStorage.setItem('admin_session', 'admin-token');
    validateAdminSession.mockResolvedValue(ADMIN);
  } else {
    localStorage.setItem('stockist_session', 'stockist-token');
    validateStockistSession.mockResolvedValue(STOCKIST);
  }
}

beforeEach(() => {
  localStorage.clear();
  validateStockistSession.mockReset();
  validateAdminSession.mockReset();
});

describe('canViewPricing', () => {
  it('admin → true', () => {
    expect(canViewPricing({ isStockist: false, isAdmin: true })).toBe(true);
  });
  it('stockist → true', () => {
    expect(canViewPricing({ isStockist: true, isAdmin: false })).toBe(true);
  });
  it('anonymous → false', () => {
    expect(canViewPricing({ isStockist: false, isAdmin: false })).toBe(false);
  });
});

describe('usePricingAccess', () => {
  it('admin session → can view pricing, not a stockist', async () => {
    loginAs('admin');
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ isAdmin: true, isStockist: false, canViewPricing: true });
    expect(validateAdminSession).toHaveBeenCalledWith('admin-token');
  });

  it('stockist session → can view pricing', async () => {
    loginAs('stockist');
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ isStockist: true, isAdmin: false, canViewPricing: true });
  });

  it('no session → no pricing and no backend calls', async () => {
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ isStockist: false, isAdmin: false, canViewPricing: false });
    expect(validateStockistSession).not.toHaveBeenCalled();
    expect(validateAdminSession).not.toHaveBeenCalled();
  });

  it('invalid admin token → no pricing, admin_session kept', async () => {
    localStorage.setItem('admin_session', 'stale');
    validateAdminSession.mockResolvedValue(null);
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canViewPricing).toBe(false);
    expect(localStorage.getItem('admin_session')).toBe('stale');
  });

  it('invalid stockist token → no pricing, stockist_session cleared', async () => {
    localStorage.setItem('stockist_session', 'stale');
    validateStockistSession.mockResolvedValue(null);
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canViewPricing).toBe(false);
    expect(localStorage.getItem('stockist_session')).toBeNull();
  });

  it('failed validation request → no pricing', async () => {
    localStorage.setItem('admin_session', 'admin-token');
    validateAdminSession.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => usePricingAccess());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.canViewPricing).toBe(false);
  });
});

describe('CatalogueClient pricing', () => {
  const products = mockProducts.slice(0, 2);
  const prices = products.map((p) => formatPrice(p.wholesalePrice));

  function renderCatalogue() {
    return render(
      <CatalogueClient
        products={products}
        makers={mockMakers}
        materialCategories={[]}
        emptyTitle="No pieces"
        emptyDescription="Try another filter"
      />
    );
  }

  it('anonymous → no prices, no Add to order', async () => {
    const { container } = renderCatalogue();
    // Let the (no-token) effect settle before asserting absence.
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(2));
    expect(container.textContent).not.toMatch(/A\$/);
    expect(screen.queryByRole('button', { name: /^Add .* to order$/ })).toBeNull();
    expect(screen.queryByRole('option', { name: /Price/ })).toBeNull();
  });

  it('admin → prices shown, no Add to order', async () => {
    loginAs('admin');
    renderCatalogue();
    for (const price of prices) {
      expect(await screen.findByText(price)).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: /^Add .* to order$/ })).toBeNull();
  });

  it('stockist → prices shown and Add to order controls', async () => {
    loginAs('stockist');
    renderCatalogue();
    for (const price of prices) {
      expect(await screen.findByText(price)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /^Add .* to order$/ })).toHaveLength(2);
  });
});

describe('StockistBannerPrompt', () => {
  const PROMPT = 'Log in as a stockist to view pricing';

  it('anonymous → prompt shown', async () => {
    render(<StockistBannerPrompt prompt={PROMPT} />);
    expect(await screen.findByText(PROMPT)).toBeInTheDocument();
  });

  it('admin → prompt hidden', async () => {
    loginAs('admin');
    render(<StockistBannerPrompt prompt={PROMPT} />);
    await waitFor(() => expect(validateAdminSession).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText(PROMPT)).toBeNull());
  });
});
