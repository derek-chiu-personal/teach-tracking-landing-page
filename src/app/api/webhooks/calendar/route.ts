import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { calendarWebhookSchema, userRoles } from '@/lib/validation';
import crypto from 'crypto';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'teach_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function mapEventTypeToStatus(type: string): string {
  switch (type) {
    case 'booking_created':
      return 'scheduled';
    case 'booking_completed':
      return 'completed';
    case 'booking_cancelled':
      return 'cancelled';
    case 'booking_no_show':
      return 'no_show';
    default:
      return 'scheduled';
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const rawBody = await request.text();
    
    const webhookSecret = process.env.CAL_WEBHOOK_SECRET;
    const signature = request.headers.get('x-cal-signature-256');

    if (webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validation = calendarWebhookSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { type, payload } = validation.data;
    const { uid: calendarEventId, attendees, startTime, endTime, location } = payload;

    const primaryAttendee = attendees[0];
    const attendeeEmail = primaryAttendee?.email;
    const attendeeName = primaryAttendee?.name || '';

    if (!attendeeEmail) {
      return NextResponse.json(
        { error: 'No attendee email found in payload' },
        { status: 400 }
      );
    }

    const meetingLink = location?.url || null;
    const scheduledAt = new Date(startTime);
    const status = mapEventTypeToStatus(type);

    await client.query('BEGIN');

    let leadResult = await client.query(
      'SELECT id FROM leads WHERE email = $1 AND deleted_at IS NULL',
      [attendeeEmail]
    );

    let leadId: string;

    if (leadResult.rows.length > 0) {
      leadId = leadResult.rows[0].id;
    } else {
      const nameParts = attendeeName.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Attendee';

      const newLeadResult = await client.query(
        `INSERT INTO leads (email, first_name, last_name, job_title, district_name, school_name, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          attendeeEmail,
          firstName,
          lastName,
          'Other',
          'Unknown District',
          null,
          null,
        ]
      );
      leadId = newLeadResult.rows[0].id;
    }

    const existingBooking = await client.query(
      'SELECT id FROM demo_bookings WHERE calendar_event_id = $1',
      [calendarEventId]
    );

    if (existingBooking.rows.length > 0) {
      await client.query(
        `UPDATE demo_bookings 
         SET status = $1, scheduled_at = $2, meeting_link = $3, lead_id = $4
         WHERE calendar_event_id = $5`,
        [status, scheduledAt, meetingLink, leadId, calendarEventId]
      );
    } else {
      await client.query(
        `INSERT INTO demo_bookings (lead_id, calendar_event_id, scheduled_at, status, meeting_link, attendee_name, attendee_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [leadId, calendarEventId, scheduledAt, status, meetingLink, attendeeName, attendeeEmail]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, lead_id: leadId },
      { status: 200 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
