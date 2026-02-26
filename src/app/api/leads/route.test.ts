import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('pg', () => {
  return {
    Pool: class MockPool {
      connect() {
        const mockClient = {
          query: vi.fn((text, params) => {
            if (text === 'BEGIN') {
              return Promise.resolve();
            }
            if (text === 'COMMIT') {
              return Promise.resolve();
            }
            if (text === 'ROLLBACK') {
              return Promise.resolve();
            }
            if (text.includes('INSERT INTO leads')) {
              if (params[0] === 'duplicate@test.com') {
                const error = new Error('duplicate key value violates unique constraint') as Error & { code: string };
                error.code = '23505';
                return Promise.reject(error);
              }
              return Promise.resolve({ rows: [{ id: 'test-uuid-1234' }] });
            }
            if (text.includes('INSERT INTO sessions')) {
              return Promise.resolve({ rows: [{ id: 'session-uuid-5678' }] });
            }
            return Promise.resolve({ rows: [] });
          }),
          release: vi.fn(),
        };
        return Promise.resolve(mockClient);
      }
    },
  };
});

async function POST(request: NextRequest) {
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'teach_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const { createLeadSchema } = await import('@/lib/validation');
  
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { attribution, ...leadData } = validation.data;

    await client.query('BEGIN');

    const leadResult = await client.query(
      `INSERT INTO leads (email, first_name, last_name, job_title, district_name, school_name, phone_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        leadData.email,
        leadData.first_name,
        leadData.last_name,
        leadData.job_title,
        leadData.district_name,
        leadData.school_name || null,
        leadData.phone_number || null,
      ]
    );

    const leadId = leadResult.rows[0].id;

    if (attribution && (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign || attribution.referrer_url)) {
      await client.query(
        `INSERT INTO sessions (lead_id, utm_source, utm_medium, utm_campaign, referrer_url, landing_page_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          leadId,
          attribution.utm_source || null,
          attribution.utm_medium || null,
          attribution.utm_campaign || null,
          attribution.referrer_url || null,
          attribution.landing_page_url || null,
        ]
      );
    }

    await client.query('COMMIT');

    return Response.json(
      { success: true, lead_id: leadId },
      { status: 201 }
    );
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return Response.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Error creating lead:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

function createMockRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as NextRequest;
}

describe('/api/leads POST', () => {
  const validPayload = {
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    job_title: 'Teacher',
    district_name: 'Test District',
    school_name: 'Test School',
    phone_number: '555-1234',
  };

  it('returns 201 on valid submission', async () => {
    const request = createMockRequest(validPayload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.lead_id).toBe('test-uuid-1234');
  });

  it('returns 201 with attribution data', async () => {
    const payload = {
      ...validPayload,
      attribution: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'iep_2026',
        referrer_url: 'https://example.com',
        landing_page_url: 'https://example.com/landing',
      },
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('returns 400 on invalid email format', async () => {
    const payload = {
      ...validPayload,
      email: 'not-an-email',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 on missing required fields', async () => {
    const payload = {
      email: 'test@example.com',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 409 on duplicate email', async () => {
    const payload = {
      ...validPayload,
      email: 'duplicate@test.com',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe('A lead with this email already exists');
  });

  it('does not create session without attribution', async () => {
    const payload = {
      ...validPayload,
      attribution: undefined,
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('creates session with partial attribution', async () => {
    const payload = {
      ...validPayload,
      attribution: {
        utm_source: 'google',
      },
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('rejects invalid job_title enum', async () => {
    const payload = {
      ...validPayload,
      job_title: 'InvalidRole',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('allows optional fields to be omitted', async () => {
    const payload = {
      email: 'minimal@test.com',
      first_name: 'Jane',
      last_name: 'Doe',
      job_title: 'Teacher',
      district_name: 'District',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
  });
});
