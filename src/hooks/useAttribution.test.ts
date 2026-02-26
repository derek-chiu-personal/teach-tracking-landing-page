import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAttribution } from '@/hooks/useAttribution';

const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost/',
    search: '',
  },
  writable: true,
});

Object.defineProperty(document, 'referrer', {
  value: '',
  writable: true,
});

describe('useAttribution hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockReturnValue(undefined);
    mockSessionStorage.removeItem.mockReturnValue(undefined);
    window.location.search = '';
    document.referrer = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns attribution data on initial render', () => {
    window.location.search = '';
    document.referrer = '';
    mockSessionStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAttribution());
    expect(result.current.attribution).toBeDefined();
  });

  it('extracts UTMs from URL params', async () => {
    window.location.search = '?utm_source=google&utm_medium=cpc&utm_campaign=iep_2026';
    document.referrer = 'https://search.google.com';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.attribution).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'iep_2026',
      referrer_url: 'https://search.google.com',
      landing_page_url: 'http://localhost/',
    });
  });

  it('stores attribution in sessionStorage when UTMs present', async () => {
    window.location.search = '?utm_source=google&utm_medium=cpc';
    document.referrer = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'attribution_data',
      JSON.stringify({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: undefined,
        referrer_url: '',
        landing_page_url: 'http://localhost/',
      })
    );
  });

  it('does not store in sessionStorage when no UTMs', async () => {
    window.location.search = '';
    document.referrer = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
  });

  it('falls back to sessionStorage on subsequent renders', async () => {
    const storedData = {
      utm_source: 'stored_source',
      utm_medium: 'stored_medium',
      utm_campaign: 'stored_campaign',
      referrer_url: 'https://stored.referrer.com',
      landing_page_url: 'https://stored.com',
    };
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(storedData));

    window.location.search = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.attribution).toEqual(storedData);
  });

  it('getAttribution returns current attribution data', async () => {
    window.location.search = '?utm_source=google';
    document.referrer = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const attribution = result.current.getAttribution();
    expect(attribution.utm_source).toBe('google');
  });

  it('clearAttribution clears storage and resets state', async () => {
    window.location.search = '?utm_source=google';
    document.referrer = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.clearAttribution();
    });

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('attribution_data');
    expect(result.current.attribution).toEqual({});
  });

  it('handles invalid JSON in sessionStorage gracefully', async () => {
    mockSessionStorage.getItem.mockReturnValue('invalid-json');

    window.location.search = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.attribution).toEqual({});
  });

  it('only stores when at least one UTM param exists', async () => {
    window.location.search = '?other_param=value';
    document.referrer = '';

    const { result } = renderHook(() => useAttribution());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
  });
});
