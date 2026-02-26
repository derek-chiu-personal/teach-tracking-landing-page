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
            
            if (text.includes('SELECT') && text.includes('video_analytics')) {
              return Promise.resolve({ rows: [] });
            }
            if (text.includes('INSERT INTO video_analytics')) {
              return Promise.resolve({ rows: [{ id: 'video-analytics-id' }] });
            }
            if (text.includes('UPDATE video_analytics')) {
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

async function POST(request: NextRequest) {
  const { Pool } = await import('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'teach_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const { videoProgressSchema } = await import('@/lib/validation');
  
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    
    const validation = videoProgressSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { video_id, watch_duration_seconds, completed, milestone_reached, clicked_cta_in_video, lead_id, ghost_id } = validation.data;

    await client.query('BEGIN');

    if (lead_id) {
      const existingRecord = await client.query(
        `SELECT id, watch_duration_seconds, milestone_reached, completed 
         FROM video_analytics 
         WHERE lead_id = $1 AND video_id = $2`,
        [lead_id, video_id]
      );

      if (existingRecord.rows.length > 0) {
        const existing = existingRecord.rows[0];
        const newDuration = Math.max(existing.watch_duration_seconds, watch_duration_seconds);
        const newCompleted = completed || existing.completed;
        
        let newMilestone = existing.milestone_reached;
        if (milestone_reached && (!existing.milestone_reached || milestone_reached !== existing.milestone_reached)) {
          newMilestone = milestone_reached;
        }

        await client.query(
          `UPDATE video_analytics 
           SET watch_duration_seconds = $1, 
               completed = $2, 
               milestone_reached = $3,
               clicked_cta_in_video = COALESCE($4, clicked_cta_in_video),
               created_at = NOW()
           WHERE lead_id = $5 AND video_id = $6`,
          [newDuration, newCompleted, newMilestone, clicked_cta_in_video, lead_id, video_id]
        );
      } else {
        await client.query(
          `INSERT INTO video_analytics (lead_id, video_id, watch_duration_seconds, completed, milestone_reached, clicked_cta_in_video)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [lead_id, video_id, watch_duration_seconds, completed || false, milestone_reached, clicked_cta_in_video || false]
        );
      }
    }

    if (ghost_id) {
      const existingGhostRecord = await client.query(
        `SELECT id, watch_duration_seconds, milestone_reached, completed 
         FROM video_analytics 
         WHERE ghost_id = $1 AND video_id = $2`,
        [ghost_id, video_id]
      );

      if (existingGhostRecord.rows.length > 0) {
        const existing = existingGhostRecord.rows[0];
        const newDuration = Math.max(existing.watch_duration_seconds, watch_duration_seconds);
        const newCompleted = completed || existing.completed;
        
        let newMilestone = existing.milestone_reached;
        if (milestone_reached && (!existing.milestone_reached || milestone_reached !== existing.milestone_reached)) {
          newMilestone = milestone_reached;
        }

        await client.query(
          `UPDATE video_analytics 
           SET watch_duration_seconds = $1, 
               completed = $2, 
               milestone_reached = $3,
               clicked_cta_in_video = COALESCE($4, clicked_cta_in_video),
               created_at = NOW()
           WHERE ghost_id = $5 AND video_id = $6`,
          [newDuration, newCompleted, newMilestone, clicked_cta_in_video, ghost_id, video_id]
        );
      } else {
        await client.query(
          `INSERT INTO video_analytics (ghost_id, video_id, watch_duration_seconds, completed, milestone_reached, clicked_cta_in_video)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [ghost_id, video_id, watch_duration_seconds, completed || false, milestone_reached, clicked_cta_in_video || false]
        );
      }
    }

    await client.query('COMMIT');

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating video progress:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}

function createMockRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as NextRequest;
}

describe('/api/video-progress POST', () => {
  const validPayload = {
    video_id: 'demo-video-1',
    watch_duration_seconds: 45,
    current_time: 45,
    lead_id: '123e4567-e89b-42d3-a456-426614174000',
  };

  it('returns 200 on valid submission with lead_id', async () => {
    const request = createMockRequest(validPayload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 200 on valid submission with ghost_id', async () => {
    const payload = {
      video_id: 'demo-video-1',
      watch_duration_seconds: 45,
      current_time: 45,
      ghost_id: '123e4567-e89b-42d3-a456-426614174001',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('returns 400 when missing lead_id and ghost_id', async () => {
    const payload = {
      video_id: 'demo-video-1',
      watch_duration_seconds: 45,
      current_time: 45,
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 on invalid lead_id format', async () => {
    const payload = {
      ...validPayload,
      lead_id: 'not-a-uuid',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 on missing video_id', async () => {
    const payload = {
      watch_duration_seconds: 45,
      current_time: 45,
      lead_id: '123e4567-e89b-42d3-a456-426614174000',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('returns 400 on negative watch_duration_seconds', async () => {
    const payload = {
      ...validPayload,
      watch_duration_seconds: -10,
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
  });

  it('accepts completed flag', async () => {
    const payload = {
      ...validPayload,
      completed: true,
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('accepts milestone_reached', async () => {
    const payload = {
      ...validPayload,
      milestone_reached: 'compliance_feature_shown',
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('accepts clicked_cta_in_video flag', async () => {
    const payload = {
      ...validPayload,
      clicked_cta_in_video: true,
    };
    const request = createMockRequest(payload);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
