import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { createLeadSchema } from '@/lib/validation';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'teach_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    
    const validation = createLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { attribution, ghost_id, ...leadData } = validation.data;

    await client.query('BEGIN');

    const leadResult = await client.query(
      `INSERT INTO leads (email, first_name, last_name, job_title, district_name, school_name, phone_number, ghost_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        leadData.email,
        leadData.first_name,
        leadData.last_name,
        leadData.job_title,
        leadData.district_name,
        leadData.school_name || null,
        leadData.phone_number || null,
        ghost_id || null,
      ]
    );

    const leadId = leadResult.rows[0].id;

    if (ghost_id) {
      await client.query(
        `UPDATE sessions SET lead_id = $1 WHERE ghost_id = $2 AND lead_id IS NULL`,
        [leadId, ghost_id]
      );
      
      await client.query(
        `UPDATE video_analytics SET lead_id = $1 WHERE ghost_id = $2 AND lead_id IS NULL`,
        [leadId, ghost_id]
      );
    }

    if (attribution && (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign || attribution.referrer_url)) {
      await client.query(
        `INSERT INTO sessions (lead_id, ghost_id, utm_source, utm_medium, utm_campaign, referrer_url, landing_page_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          leadId,
          ghost_id || null,
          attribution.utm_source || null,
          attribution.utm_medium || null,
          attribution.utm_campaign || null,
          attribution.referrer_url || null,
          attribution.landing_page_url || null,
        ]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, lead_id: leadId },
      { status: 201 }
    );
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'A lead with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
