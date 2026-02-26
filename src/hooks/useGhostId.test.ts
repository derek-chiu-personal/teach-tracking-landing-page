import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGhostId, generateUUID, getOrCreateGhostId, isValidUUID } from '@/hooks/useGhostId';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012-3456-7890abcd'),
  },
  writable: true,
});

describe('useGhostId hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockLocalStorage.removeItem.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('generates a new UUID when none exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const uuid = generateUUID();
    expect(uuid).toBeDefined();
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('returns existing ghost_id from localStorage', () => {
    const existingId = '123e4567-e89b-42d3-a456-426614174000';
    mockLocalStorage.getItem.mockReturnValue(existingId);
    
    const id = getOrCreateGhostId();
    expect(id).toBe(existingId);
  });

  it('creates new ghost_id if localStorage value is invalid', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-uuid');
    
    const id = getOrCreateGhostId();
    expect(id).toBeDefined();
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('stores new ghost_id in localStorage when created', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const id = getOrCreateGhostId();
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('ghost_id', id);
  });
});

describe('isValidUUID', () => {
  it('returns true for valid UUID v4', () => {
    expect(isValidUUID('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('returns false for invalid UUID', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
    expect(isValidUUID('')).toBe(false);
  });
});
