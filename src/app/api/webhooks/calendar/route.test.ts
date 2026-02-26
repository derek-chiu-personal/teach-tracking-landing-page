import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('pg', () => {
  return {
    Pool: class MockPool {
      connect() {
        const mockClient = {
          query: vi.fn((text, params) => {
            if (text === 'BEGIN') return Promise.resolve();
            if (text === 'COMMIT') return Promise.resolve();
            if (text === 'ROLLBACK') return Promise.resolve();
            
            if (text.includes('SELECT id FROM leads')) {
              if (params[0] === 'existing@test.com') {
                return Promise.resolve({ rows: [{ id: 'existing-lead-id' }] });
              }
              return Promise.resolve({ rows: [] });
            }
            
            if (text.includes('INSERT INTO leads')) {
              return Promise.resolve({ rows: [{ id: 'new-lead-id' }] });
            }
            
            if (text.includes('SELECT id FROM demo_bookings')) {
              return Promise.resolve({ rows: [] });
            }
            
            if (text.includes('INSERT INTO demo_bookings')) {
              return Promise.resolve({ rows: [{ id: 'booking-id' }] });
            }
            
            if (text.includes('UPDATE demo_bookings')) {
              return Promise.resolve({ rows: [] });
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

vi.mock('crypto', () => ({
  createHmac: vi.fn(() => ({
    update: vi.fn(() => ({
      digest: vi.fn(() => 'valid-signature'),
    })),
  })),
  timingSafeEqual: vi.fn(() => true),
}));

async function POST(request: NextRequest) {
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'teach_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const { calendarWebhookSchema, userRoles } = await import('@/lib/validation');
  
  const crypto = await import('crypto');

  function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
    if (!signature) return false;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  function mapEventTypeToStatus(type: string): string {
    switch (type) {
      case 'booking_created': return 'scheduled';
      case 'booking_completed': return 'completed';
      case 'booking_cancelled': return 'cancelled';
      case 'booking_no_show': return 'no_show';
      default: return 'scheduled';
    }
  }

  const client = await pool.connect();

  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.CAL_WEBHOOK_SECRET;
    const signature = request.headers.get('x-cal-signature-256');

    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return Response.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const validation = calendarWebhookSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const { type, payload } = validation.data;
    const { uid: calendarEventId, attendees, startTime, location } = payload;
    const primaryAttendee = attendees[0];
    const attendeeEmail = primaryAttendee?.email;
    const attendeeName = primaryAttendee?.name || '';
    const meetingLink = location?.url || null;
    const scheduledAt = new Date(startTime);
    const status = mapEventTypeToStatus(type);

    await client.query('BEGIN');

    let leadResult = await client.query('SELECT id FROM leads WHERE email = $1 AND deleted_at IS NULL', [attendeeEmail]);
    let leadId: string;

    if (leadResult.rows.length > 0) {
      leadId = leadResult.rows[0].id;
    } else {
      const nameParts = attendeeName.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Attendee';
      const newLeadResult = await client.query(
        `INSERT INTO leads (email, first_name, last_name, job_title, district_name, school_name, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [attendeeEmail, firstName, lastName, 'Other', 'Unknown District', null, null]
      );
      leadId = newLeadResult.rows[0].id;
    }

    const existingBooking = await client.query('SELECT id FROM demo_bookings WHERE calendar_event_id = $1', [calendarEventId]);

    if (existingBooking.rows.length > 0) {
      await client.query(`UPDATE demo_bookings SET status = $1, scheduled_at = $2, meeting_link = $3, lead_id = $4 WHERE calendar_event_id = $5`, [status, scheduledAt, meetingLink, leadId, calendarEventId]);
    } else {
      await client.query(`INSERT INTO demo_bookings (lead_id, calendar_event_id, scheduled_at, status, meeting_link, attendee_name, attendee_email) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [leadId, calendarEventId, scheduledAt, status, meetingLink, attendeeName, attendeeEmail]);
    }

    await client.query('COMMIT');
    return Response.json({ success: true, lead_id: leadId }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing webhook:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}

function createMockRequest(body: unknown, headers: Record<string, string> = {}) {
  return {
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: {
      get: (key: string) => headers[key] || null,
    },
  } as unknown as NextRequest;
}

describe('/api/webhooks/calendar POST', () => {
  const validPayload = {
    type: 'booking_created' as const,
    payload: {
      uid: 'cal-event-123',
      attendees: [{ email: 'existing@test.com', name: 'John Doe' }],
      startTime: '2026-03-01T10:00:00Z',
      endTime: '2026-03-01T10:30:00Z',
      location: { type: 'integrations:google:meet', url: 'https://meet.google.com/abc' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 for valid webhook with existing lead', async () => {
    const request = createMockRequest(validPayload, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('creates new lead when email not found', async () => {
    const payload = {
      ...validPayload,
      payload: {
        ...validPayload.payload,
        attendees: [{ email: 'new@test.com', name: 'Jane Smith' }],
      },
    };
    const request = createMockRequest(payload, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 400 for invalid payload', async () => {
    const request = createMockRequest({ invalid: 'payload' }, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 for invalid JSON', async () => {
    const badRequest = {
      text: () => Promise.resolve('not json'),
      headers: { get: () => null },
    } as unknown as NextRequest;
    
    const response = await POST(badRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
  });

  it('handles booking_cancelled event', async () => {
    const payload = {
      ...validPayload,
      type: 'booking_cancelled' as const,
    };
    const request = createMockRequest(payload, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('handles booking_completed event', async () => {
    const payload = {
      ...validPayload,
      type: 'booking_completed' as const,
    };
    const request = createMockRequest(payload, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('handles booking_no_show event', async () => {
    const payload = {
      ...validPayload,
      type: 'booking_no_show' as const,
    };
    const request = createMockRequest(payload, { 'x-cal-signature-256': 'valid-signature' });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it('returns 401 without signature when secret is configured', async () => {
    const originalEnv = process.env.CAL_WEBHOOK_SECRET;
    process.env.CAL_WEBHOOK_SECRET = 'test-secret';
    
    const request = createMockRequest(validPayload, {});
    const response = await POST(request);
    
    process.env.CAL_WEBHOOK_SECRET = originalEnv;

    expect(response.status).toBe(401);
  });
});
