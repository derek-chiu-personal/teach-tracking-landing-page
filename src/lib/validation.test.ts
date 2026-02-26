import { describe, it, expect } from 'vitest';
import { createLeadSchema, attributionSchema } from '@/lib/validation';

describe('validation schemas', () => {
  describe('attributionSchema', () => {
    it('validates empty object', () => {
      const result = attributionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('validates full attribution data', () => {
      const result = attributionSchema.safeParse({
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'iep_compliance_2026',
        referrer_url: 'https://example.com',
        landing_page_url: 'https://example.com/landing',
      });
      expect(result.success).toBe(true);
    });

    it('allows optional utm fields', () => {
      const result = attributionSchema.safeParse({
        utm_source: 'google',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid url for referrer_url', () => {
      const result = attributionSchema.safeParse({
        referrer_url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('allows empty string for optional urls', () => {
      const result = attributionSchema.safeParse({
        referrer_url: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createLeadSchema', () => {
    const validLead = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      job_title: 'Teacher' as const,
      district_name: 'Test District',
      school_name: 'Test School',
      phone_number: '555-1234',
    };

    it('validates valid lead input', () => {
      const result = createLeadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('validates lead without optional fields', () => {
      const { school_name, phone_number, ...rest } = validLead;
      const result = createLeadSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email format', () => {
      const result = createLeadSchema.safeParse({
        ...validLead,
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty email', () => {
      const result = createLeadSchema.safeParse({
        ...validLead,
        email: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing first_name', () => {
      const { first_name, ...rest } = validLead;
      const result = createLeadSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects missing last_name', () => {
      const { last_name, ...rest } = validLead;
      const result = createLeadSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects missing district_name', () => {
      const { district_name, ...rest } = validLead;
      const result = createLeadSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it('rejects invalid job_title', () => {
      const result = createLeadSchema.safeParse({
        ...validLead,
        job_title: 'InvalidRole',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty first_name', () => {
      const result = createLeadSchema.safeParse({
        ...validLead,
        first_name: '',
      });
      expect(result.success).toBe(false);
    });

    it('validates all valid job_title enums', () => {
      const roles = [
        'Administrator',
        'Special Ed Coordinator',
        'Teacher',
        'IT/Operations',
        'Other',
      ] as const;

      for (const role of roles) {
        const result = createLeadSchema.safeParse({
          ...validLead,
          job_title: role,
        });
        expect(result.success).toBe(true);
      }
    });

    it('validates lead with attribution', () => {
      const result = createLeadSchema.safeParse({
        ...validLead,
        attribution: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'test',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
