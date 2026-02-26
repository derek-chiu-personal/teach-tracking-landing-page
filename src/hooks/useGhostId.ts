'use client';

import { useEffect, useState, useCallback } from 'react';

const GHOST_ID_KEY = 'ghost_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateGhostId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const stored = localStorage.getItem(GHOST_ID_KEY);
  if (stored && isValidUUID(stored)) {
    return stored;
  }

  const newGhostId = generateUUID();
  localStorage.setItem(GHOST_ID_KEY, newGhostId);
  return newGhostId;
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function useGhostId() {
  const [ghostId, setGhostId] = useState<string>('');

  useEffect(() => {
    const id = getOrCreateGhostId();
    setGhostId(id);
  }, []);

  const getGhostId = useCallback((): string => {
    return getOrCreateGhostId();
  }, []);

  const clearGhostId = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GHOST_ID_KEY);
      setGhostId('');
    }
  }, []);

  return {
    ghostId,
    getGhostId,
    clearGhostId,
  };
}

export { generateUUID, getOrCreateGhostId, isValidUUID };
