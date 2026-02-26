'use client';

import { useEffect, useState, useCallback } from 'react';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_url?: string;
  landing_page_url?: string;
}

const ATTRIBUTION_KEY = 'attribution_data';

function getInitialAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = sessionStorage.getItem(ATTRIBUTION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionData = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    referrer_url: typeof document !== 'undefined' ? document.referrer : undefined,
    landing_page_url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign) {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }

  return attribution;
}

export function useAttribution() {
  const [attribution, setAttribution] = useState<AttributionData>({});

  useEffect(() => {
    setAttribution(getInitialAttribution());
  }, []);

  const getAttribution = useCallback((): AttributionData => {
    if (typeof window === 'undefined') {
      return {};
    }

    const stored = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }

    return getInitialAttribution();
  }, []);

  const clearAttribution = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ATTRIBUTION_KEY);
      setAttribution({});
    }
  }, []);

  return {
    attribution,
    getAttribution,
    clearAttribution,
  };
}
